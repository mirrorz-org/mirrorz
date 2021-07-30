package main

import (
    "fmt"
    "strings"
    "net"
    "net/http"
    "math/rand"
    "time"

    "context"
    "github.com/influxdata/influxdb-client-go/v2"
    "github.com/influxdata/influxdb-client-go/v2/api"

    "encoding/json"
    "io/ioutil"
    "path/filepath"

    "flag"

    "github.com/juju/loggo"

    "sort"
)

type Config struct {
    InfluxDBURL string `json:"influxdb-url"`
    InfluxDBToken string `json:"influxdb-token"`
    InfluxDBBucket string `json:"influxdb-bucket"`
    InfluxDBOrg string `json:"influxdb-org"`
    IPASNURL string `json:"ipasn-url"`
    HTTPBindAddress string `json:"http-bind-address"`
    MirrorZDDirectory string `json:"mirrorz-d-directory"`
    DomainLength int `json:"domain-length"`
}

var logger = loggo.GetLogger("mirrorzd")
var config Config

var client influxdb2.Client
var queryAPI api.QueryAPI

func LoadConfig (path string, debug bool) (err error) {
    if debug {
        loggo.ConfigureLoggers("mirrorzd=DEBUG")
    } else {
        loggo.ConfigureLoggers("mirrorzd=INFO")
    }

    file, err := ioutil.ReadFile(path)
    if (err != nil) {
        logger.Errorf("LoadConfig ReadFile failed: %v\n", err)
        return
    }
    err = json.Unmarshal([]byte(file), &config)
    if (err != nil) {
        logger.Errorf("LoadConfig json Unmarshal failed: %v\n", err)
        return
    }
    if (config.InfluxDBToken == "") {
        logger.Errorf("LoadConfig find no InfluxDBToken in file\n")
        return
    }
    if (config.InfluxDBURL == "") {
        config.InfluxDBURL = "http://localhost:8086"
    }
    if (config.InfluxDBBucket == "") {
        config.InfluxDBBucket = "mirrorz"
    }
    if (config.InfluxDBOrg == "") {
        config.InfluxDBOrg = "mirrorz"
    }
    if (config.IPASNURL == "") {
        config.IPASNURL = "http://localhost:8889"
    }
    if (config.HTTPBindAddress == "") {
        config.HTTPBindAddress = "localhost:8888"
    }
    if (config.MirrorZDDirectory == "") {
        config.MirrorZDDirectory = "mirrorz.d"
    }
    if (config.DomainLength == 0) {
        // 4 for *.mirrors.edu.cn
        // 4 for *.m.mirrorz.org
        config.DomainLength = 4
    }
    logger.Debugf("LoadConfig InfluxDB URL: %s\n", config.InfluxDBURL)
    logger.Debugf("LoadConfig InfluxDB Org: %s\n", config.InfluxDBOrg)
    logger.Debugf("LoadConfig InfluxDB Bucket: %s\n", config.InfluxDBBucket)
    logger.Debugf("LoadConfig IPASN URL: %s\n", config.IPASNURL)
    logger.Debugf("LoadConfig HTTP Bind Address: %s\n", config.HTTPBindAddress)
    logger.Debugf("LoadConfig MirrorZ D Directory: %s\n", config.MirrorZDDirectory)
    logger.Debugf("LoadConfig Domain Length: %d\n", config.DomainLength)
    return
}

var AbbrToEndpoints map[string][]Endpoint

func Handler(w http.ResponseWriter, r *http.Request) {
    // [1:] for no heading `/`
    pathArr := strings.SplitN(r.URL.Path[1:], "/", 2)

    cname := ""
    tail := ""
    if len(pathArr) == 0 {
        fmt.Fprintf(w, "/")
    } else {
        cname = pathArr[0]
        if len(pathArr) == 2 {
            tail = "/" + pathArr[1]
        }
    }

    _, trace := r.URL.Query()["trace"]

    url, traceStr, _ := Resolve(r, cname, trace)

    if trace {
        fmt.Fprintf(w, "%s", traceStr)
    } else if url == "" {
        http.NotFound(w, r)
    } else {
        http.Redirect(w, r, fmt.Sprintf("%s%s", url, tail), http.StatusFound)
    }
}

func Scheme (r *http.Request) (scheme string) {
    scheme = r.Header.Get("X-Forwarded-Proto")
    if (scheme == "") {
        scheme = "https"
    }
    return
}

func IP (r *http.Request) (ip net.IP) {
    ip = net.ParseIP(r.Header.Get("X-Real-IP"))
    return
}

func ASN (ip net.IP) (asn string) {
    client := http.Client {
        Timeout: 500 * time.Millisecond,
    }
    req := config.IPASNURL + "/" + ip.String()
    resp, err := client.Get(req)
    if err != nil {
        logger.Errorf("IPASN HTTP Get failed: %v\n", err)
        return
    }
    defer resp.Body.Close()
    body, err := ioutil.ReadAll(resp.Body)
    asn = string(body)
    return
}

func Host (r *http.Request) (labels []string) {
    dots := strings.Split(r.Header.Get("X-Forwarded-Host"), ".")
    if (len(dots) != config.DomainLength) {
        return
    }
    labels = strings.Split(dots[0], "-")
    return
}

type Score struct {
    pos int // pos of label, bigger the better
    mask int // maximum mask
    as int // is in
    delta int // often negative

    // payload
    resolve string
    repo string

    // aux
    v4 bool
    v6 bool
}

// For reference on delta precedence
/*
func CompareScore(l, r Score) int {
    // ret > 0 means r > l
    if (l.pos != r.pos) {
        return r.pos - l.pos
    }
    if (l.mask != r.mask) {
        return r.mask - l.mask
    }
    if (l.as != r.as) {
        if (l.as == 1) {
            return -1
        } else {
            return 1
        }
    }
    if (l.delta == 0) {
        return +1
    } else if (r.delta == 0) {
        return -1
    } else if (l.delta < 0 && r.delta > 0) {
        return -1
    } else if (r.delta < 0 && l.delta > 0) {
        return +1
    } else if (r.delta > 0 && l.delta > 0) {
        return l.delta - r.delta
    } else {
        return r.delta - l.delta
    }
    return 0
}
*/

type Scores []Score

func (s Scores) Len() int { return len(s) }
func (s Scores) Less(l, r int) bool {
    if (s[l].delta == 0) {
        return false
    } else if (s[r].delta == 0) {
        return true
    } else if (s[l].delta < 0 && s[r].delta > 0) {
        return true
    } else if (s[r].delta < 0 && s[l].delta > 0) {
        return false
    } else if (s[r].delta > 0 && s[l].delta > 0) {
        return (s[l].delta - s[r].delta) <= 0
    } else {
        return (s[r].delta - s[l].delta) <= 0
    }
}
func (s Scores) Swap(l, r int) { s[l], s[r] = s[r], s[l] }

func (l Score) Dominate(r Score) bool {
    deltaDominate := false
    if l.delta == 0 && r.delta == 0 {
        deltaDominate = true
    } else if l.delta < 0 && r.delta < 0 && l.delta >= r.delta {
        deltaDominate = true
    } else if l.delta > 0 && r.delta > 0 && l.delta <= r.delta {
        deltaDominate = true
    }
    rangeDominate := false
    if l.mask > r.mask || (l.mask == r.mask && l.as >= r.as && r.as != 1) {
        rangeDominate = true
    }
    return l.pos >= r.pos && rangeDominate && deltaDominate
}

func (l Score) DeltaOnly() bool {
    return l.pos == 0 && l.mask == 0 && l.as == 0
}

func Resolve(r *http.Request, cname string, trace bool) (url string, traceStr string, err error) {
    traceFunc := func(s string) {
        logger.Debugf(s);
        if trace {
            traceStr += s;
        }
    }

    query := fmt.Sprintf(`from(bucket:"%s")
        |> range(start: -15m)
        |> filter(fn: (r) => r._measurement == "repo" and r.name == "%s")
        |> map(fn: (r) => ({_value:r._value,mirror:r.mirror,_time:r._time,path:r.url}))
        |> tail(n:1)`, config.InfluxDBBucket, cname)
    // SQL INJECTION!!!

    res, err := queryAPI.Query(context.Background(), query)

    var scores Scores
    var resolve string
    var repo string

    labels := Host(r)
    remoteIP := IP(r)
    asn := ASN(remoteIP)
    traceFunc(fmt.Sprintf("labels: %v\n", labels))
    traceFunc(fmt.Sprintf("IP: %v\n", remoteIP))
    traceFunc(fmt.Sprintf("ASN: %s\n", asn))

    if err == nil {
        for res.Next() {
            record := res.Record()
            abbr := record.ValueByKey("mirror").(string)
            traceFunc(fmt.Sprintf("abbr: %s\n", abbr))
            endpoints, ok := AbbrToEndpoints[abbr]
            if (ok) {
                var scoresEndpoints Scores
                for _, endpoint := range endpoints {
                    traceFunc(fmt.Sprintf("  endpoint: %s %s\n", endpoint.Resolve, endpoint.Label))
                    score := Score {pos: 0, as: 0, mask: 0, delta: 0, v4: false, v6: false}
                    score.delta = int(record.Value().(int64))
                    for index, label := range labels {
                        if label == endpoint.Label {
                            score.pos = index + 1
                        }
                    }
                    for _, indicator := range endpoint.Range {
                        if indicator == "V4" {
                            score.v4 = true
                        } else if indicator == "V6" {
                            score.v6 = true
                        } else if strings.HasPrefix(indicator, "AS") {
                            if indicator[2:] == asn {
                                score.as = 1
                            }
                        } else {
                            _, ipnet, _ := net.ParseCIDR(indicator)
                            if remoteIP != nil && ipnet != nil && ipnet.Contains(remoteIP) {
                                mask, _ := ipnet.Mask.Size()
                                if mask > score.mask {
                                    score.mask = mask
                                }
                            }
                        }
                    }


                    score.resolve = endpoint.Resolve
                    score.repo = record.ValueByKey("path").(string)
                    traceFunc(fmt.Sprintf("    score: %v\n", score))

                    if score.delta < -60*60*24*3 { // 3 days
                        traceFunc(fmt.Sprintf("    not up-to-date enough\n"))
                        continue
                    }
                    if !endpoint.Public && score.mask == 0 && score.as == 0 {
                        traceFunc(fmt.Sprintf("    not hit private\n"))
                        continue
                    }
                    if !score.v4 && len(labels) != 0 && labels[len(labels)-1] == "4" {
                        traceFunc(fmt.Sprintf("    not hit v4\n"))
                        continue
                    }
                    if !score.v6 && len(labels) != 0 && labels[len(labels)-1] == "6" {
                        traceFunc(fmt.Sprintf("    not hit v6\n"))
                        continue
                    }
                    if score.v4 && score.pos == 0 && (len(labels) == 0 || len(labels) != 0 && labels[len(labels)-1] != "4") {
                        traceFunc(fmt.Sprintf("    label not v4only or specify v4 endpoint\n"))
                        continue
                    }
                    if score.v6 && score.pos == 0 && (len(labels) == 0 || len(labels) != 0 && labels[len(labels)-1] != "6") {
                        traceFunc(fmt.Sprintf("    label not v6only or specify v6 endpoint\n"))
                        continue
                    }

                    scoresEndpoints = append(scoresEndpoints, score)
                }

                // Find the not-dominated scores, or the first one
                if len(scoresEndpoints) > 0 {
                    var optimalScores Scores
                    for i, l := range scoresEndpoints {
                        dominated := false
                        for j, r := range scoresEndpoints {
                            if i != j && r.Dominate(l) {
                                dominated = true
                            }
                        }
                        if !dominated {
                            optimalScores = append(optimalScores, l)
                        }
                    }
                    if len(optimalScores) > 0 && len(optimalScores) != len(scoresEndpoints) {
                        for index, score := range optimalScores {
                            traceFunc(fmt.Sprintf("  optimal scores: %d %v\n", index, score))
                            scores = append(scores, score)
                        }
                    } else if len(scoresEndpoints) > 0 {
                        traceFunc(fmt.Sprintf("  first score: %v\n", scoresEndpoints[0]))
                        scores = append(scores, scoresEndpoints[0])
                    } else {
                        traceFunc(fmt.Sprintf("  no score found\n"))
                    }
                }
            }
        }
        if res.Err() != nil {
            logger.Errorf("Resolve query parsing error: %s\n", res.Err().Error())
        }
    } else {
        logger.Errorf("Resolve query: %v\n", err)
    }

    if len(scores) > 0 {
        for index, score := range scores {
            traceFunc(fmt.Sprintf("scores: %d %v\n", index, score))
        }
        var optimalScores Scores
        allDelta := true;
        for i, l := range scores {
            dominated := false
            for j, r := range scores {
                if i != j && r.Dominate(l) {
                    dominated = true
                }
            }
            if !dominated {
                optimalScores = append(optimalScores, l)
            }
            if !l.DeltaOnly() {
                allDelta = false;
            }
        }
        if len(optimalScores) == 0 {
            logger.Warningf("Resolve optimal scores empty, algorithm implemented error")
            resolve = scores[0].resolve
            repo = scores[0].repo
        } else if allDelta {
            // randomly choose one mirror from the optimal half
            // len(optimalScores) == 1
            sort.Sort(scores)
            for index, score := range scores {
                traceFunc(fmt.Sprintf("sorted delta scores: %d %v\n", index, score))
            }
            randRange := (len(scores)+1)/2
            randIndex := rand.Intn(randRange)
            traceFunc(fmt.Sprintf("randomly chosen score: (%d/%d) %v\n", randIndex, randRange-1, scores[randIndex]))
            resolve = scores[randIndex].resolve
            repo = scores[randIndex].repo
        } else {
            // randomly choose one mirror not dominated by others
            for index, score := range optimalScores {
                traceFunc(fmt.Sprintf("optimal scores: %d %v\n", index, score))
            }
            randIndex := rand.Intn(len(optimalScores))
            traceFunc(fmt.Sprintf("randomly chosen score: %d %v\n", randIndex, optimalScores[randIndex]))
            resolve = optimalScores[randIndex].resolve
            repo = optimalScores[randIndex].repo
        }
    } else {
        return
    }

    if (strings.HasPrefix(repo, "http://") || strings.HasPrefix(repo, "https://")) {
        url = repo
    } else {
        scheme := Scheme(r)
        url = fmt.Sprintf("%s://%s%s", scheme, resolve, repo)
    }
    logger.Infof("Resolved: %s (%v, %s) %v\n", url, remoteIP, asn, labels)
    return
}

type Endpoint struct {
    Label string `json:"label"`
    Resolve string `json:"resolve"`
    Public bool `json:"public"`
    Range []string `json:"range"`
}

type Site struct {
    Abbr string `json:"abbr"`
}

type MirrorZD struct {
    Extension string `json:"extension"`
    Endpoints []Endpoint `json:"endpoints"`
    Site Site `json:"site"`
}

func LoadMirrorZD (path string) (err error) {
    files, err := ioutil.ReadDir(path)
    if err != nil {
        logger.Errorf("LoadMirrorZD: can not open mirrorz.d directory, %v\n", err)
        return
    }
    for _, file := range files {
        if !strings.HasSuffix(file.Name(), ".json") {
            continue
        }
        content, err := ioutil.ReadFile(filepath.Join(path, file.Name()))
        if err != nil {
            logger.Errorf("LoadMirrorZD: read %s failed\n", file.Name())
            continue
        }
        var data MirrorZD
        err = json.Unmarshal([]byte(content), &data)
        if err != nil {
            logger.Errorf("LoadMirrorZD: process %s failed\n", file.Name())
            continue
        }
        logger.Infof("%+v\n", data)
        AbbrToEndpoints[data.Site.Abbr] = data.Endpoints
    }
    return
}

func OpenInfluxDB() {
    client = influxdb2.NewClient(config.InfluxDBURL, config.InfluxDBToken)
    queryAPI = client.QueryAPI(config.InfluxDBOrg)
}

func CloseInfluxDB() {
    client.Close()
}

func main() {
    rand.Seed(time.Now().Unix())

    configPtr := flag.String("config", "config.json", "path to config file")
    debugPtr := flag.Bool("debug", false, "debug mode")
    flag.Parse()
    LoadConfig(*configPtr, *debugPtr)

    OpenInfluxDB()

    AbbrToEndpoints = make(map[string][]Endpoint)
    LoadMirrorZD(config.MirrorZDDirectory)

    http.HandleFunc("/", Handler)
    logger.Errorf("HTTP Server error: %v\n", http.ListenAndServe(config.HTTPBindAddress, nil))

    CloseInfluxDB()
}

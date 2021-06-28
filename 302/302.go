package main

import (
    "fmt"
    "log"
    "strings"
    "net"
    "net/http"

    "context"
    "github.com/influxdata/influxdb-client-go/v2"

    "encoding/json"
    "io/ioutil"
)

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

    url, _ := Resolve(r, cname)

    if url == "" {
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

func Host (r *http.Request) (labels []string) {
    dots := strings.Split(r.Header.Get("X-Forwarded-Host"), ".")
    fmt.Printf("dot: %v\n", dots)
    if (len(dots) != 4) { // *.mirrors.edu.cn
        return
    }
    labels = strings.Split(dots[0], "-")
    return
}

type Score struct {
    pos int64 // pos of label, bigger the better
    as bool // is in 
    mask int64 // maximum mask
    delta int64 // often negative
}

func CompareScore(l, r Score) int64 {
    // ret > 0 means r > l
    if (l.pos != r.pos) {
        return r.pos - l.pos
    }
    if (l.as != r.as) {
        if (l.as) {
            return -1
        } else {
            return 1
        }
    }
    if (l.mask != r.mask) {
        return r.mask - l.mask
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

func Resolve(r *http.Request, cname string) (url string, err error) {
    org := "mirrorz"
    token := ""
    dbUrl := "http://localhost:8086"

    query := fmt.Sprintf(`from(bucket:"mirrorz")
        |> range(start: -5m) 
        |> filter(fn: (r) => r._measurement == "repo" and r.name == "%s")
        |> map(fn: (r) => ({_value:r._value,mirror:r.mirror,_time:r._time,path:r.url}))
        |> limit(n:1)`, cname)
    // SQL INJECTION!!!

    client := influxdb2.NewClient(dbUrl, token)
    queryAPI := client.QueryAPI(org)
    res, err := queryAPI.Query(context.Background(), query)
    client.Close()

    score := Score {pos: 0, as: false, mask: 0, delta: 0}
    var resolve string
    var repo string

    labels := Host(r)
    fmt.Printf("lab: %v\n", labels)

    if err == nil {
        for res.Next() {
            record := res.Record()
            abbr := record.ValueByKey("mirror").(string)
            fmt.Printf("abbr: %s\n", abbr)
            endpoints, ok := AbbrToEndpoints[abbr]
            if (ok) {
                for _, endpoint := range endpoints {
                    fmt.Printf("endp: %s %s\n", endpoint.Resolve, endpoint.Label)
                    newScore := Score {pos: 0, as: false, mask: 0, delta: 0}
                    newScore.delta = record.Value().(int64)
                    for index, label := range labels {
                        if (label == endpoint.Label) {
                            newScore.pos = int64(index + 1)
                        }
                    }
                    for _, indicator := range endpoint.Range {
                        if (strings.HasPrefix(indicator, "ASN")) {
                        } else {
                            _, ipnet, _ := net.ParseCIDR(indicator)
                            remoteIp := IP(r)
                            if (remoteIp != nil && ipnet != nil && ipnet.Contains(remoteIp)) {
                                mask, _ := ipnet.Mask.Size()
                                if (int64(mask) > newScore.mask) {
                                    newScore.mask = int64(mask)
                                }
                            }
                        }
                    }

                    fmt.Printf("sco: %v %v\n", score, newScore)

                    ret := CompareScore(score, newScore)
                    if (ret > 0) {
                        score = newScore
                        resolve = endpoint.Resolve
                        repo = record.ValueByKey("path").(string)
                    }
                }
            }
        }
        if res.Err() != nil {
            fmt.Printf("query parsing error: %s\n", res.Err().Error())
        }
    } else {
        panic(err)
    }
    if (strings.HasPrefix(repo, "http://") || strings.HasPrefix(repo, "https://")) {
        url = repo
    } else {
        scheme := Scheme(r)
        url = fmt.Sprintf("%s://%s%s", scheme, resolve, repo)
    }
    fmt.Println("")
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

func LoadMirrorZD (path string) {
    file, _ := ioutil.ReadFile(path)
    data := MirrorZD {}
    _ = json.Unmarshal([]byte(file), &data)
    fmt.Printf("%+v\n", data)
    AbbrToEndpoints[data.Site.Abbr] = data.Endpoints
}

func main() {
    AbbrToEndpoints = make(map[string][]Endpoint)
    LoadMirrorZD("mirrorz.d/ustc.json")
    LoadMirrorZD("mirrorz.d/nano.json")

    http.HandleFunc("/", Handler)
    log.Fatal(http.ListenAndServe("127.0.0.1:8888", nil))
}

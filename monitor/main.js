const jsdom = require("jsdom");
const { JSDOM } = jsdom;
global.DOMParser = new JSDOM().window.DOMParser;

Timeout = require("await-timeout");
const timeout = 15000;

fetch_extra = require("node-fetch-extra");
async function fetchV6First (u, opt) {
  const promise = fetch_extra(u, {family: 6, ...opt});
  return await Timeout.wrap(promise, timeout/10, 'Timeout').catch(async (e) => {
    const promise = fetch_extra(u, opt);
    return await Timeout.wrap(promise, timeout/3, 'Timeout').catch(() => null);
  });
}
global.fetch = fetchV6First;

lzu = require("./parser/lzu");
nju = require("./parser/nju");
neusoft = require("./parser/neusoft");
hust = require("./parser/hust");
bfsu = require("./parser/bfsu");
nano = require("./parser/nano");
neo = require("./parser/neo");
hit = require("./parser/hit");
cqu = require("./parser/cqu");
xjtu = require("./parser/xjtu");
zju = require("./parser/zju");
scau = require("./parser/scau");
neu = require("./parser/neu");
nyist = require("./parser/nyist");
pku = require("./parser/pku");
byrio = require("./parser/byrio");
cqupt = require("./parser/cqupt");
ynuosa = require("./parser/ynuosa");
xtom = require("./parser/xtom");
xtom_hk = require("./parser/xtom-hk");
xtom_de = require("./parser/xtom-de");
xtom_nl = require("./parser/xtom-nl");
xtom_ee = require("./parser/xtom-ee");
njupt = require("./parser/njupt");

const LIST = [
  lzu,
  nju,
  neusoft,
  hust,
  bfsu,
  nano,
  neo,
  hit,
  cqu,
  xjtu,
  zju,
  scau,
  neu,
  nyist,
  pku,
  byrio,
  cqupt,
  ynuosa,
  xtom,
  xtom_hk,
  xtom_de,
  xtom_nl,
  xtom_ee,
  njupt,
  "https://status.tuna.wiki/mirrorz/static/opentuna.json",
  "https://mirrors.ustc.edu.cn/static/json/mirrorz.json",
  "https://mirror.sjtu.edu.cn/mirrorz/siyuan.json",
  "https://mirror.sjtu.edu.cn/mirrorz/zhiyuan.json",
//  "https://mirrors.dgut.edu.cn/static/mirrorz.json",
  "https://mirrors.sustech.edu.cn/mirrorz/mirrorz.json",
  "https://iptv.uestc.edu.cn/mirrors/mirrorz.json",
  "https://mirrors.nwafu.edu.cn/api/mirrorz/info.json",
];

// cname: async (repourl: string) => unix_timestamp: int
const REPO = {
  "archlinux": require("./lastupdate/archlinux"),
  "arch4edu": require("./lastupdate/arch4edu"),
  "archlinuxcn": require("./lastupdate/archlinuxcn"),
  "blackarch": require("./lastupdate/blackarch"),
  "anthon": require("./lastupdate/anthon"),
  "centos": require("./lastupdate/centos"),
  "centos-altarch": require("./lastupdate/centos-altarch"),
  "centos-vault": require("./lastupdate/centos-vault"),
  "ceph": require("./lastupdate/ceph"),
  "chakra": require("./lastupdate/chakra"),
  "gnu": require("./lastupdate/gnu"),
  "gnu-alpha": require("./lastupdate/gnu-alpha"),
  "mageia": require("./lastupdate/mageia"),
  "manjaro": require("./lastupdate/manjaro"),
  "manjaro-arm": require("./lastupdate/manjaro-arm"),
  "mariadb": require("./lastupdate/mariadb"),
  "msys2": require("./lastupdate/msys2"),
  "postgresql": require("./lastupdate/postgresql"),
};

const {InfluxDB, Point, HttpError} = require('@influxdata/influxdb-client')
const {url, token, org, bucket} = require('./env')

const writeApi = new InfluxDB({url, token}).getWriteApi(org, bucket, 'ns')
const cur = new Date();

async function write(f) {
  let mirrorz;
  let points = [];
  if (typeof(f) == "string") {
    const resp = await fetch(f);
    if (resp == null) {
      //console.log(f);
      return points
    }
    mirrorz = await resp.json();
  } else {
    mirrorz = await f();
  }

  const site = new Point('site')
    .timestamp(cur)
    .tag('mirror', mirrorz.site.abbr)
    .tag('url', mirrorz.site.url)
    .intField('value', 1);
  points.push(site)
  //console.log(` ${site}`)

  await Promise.all(mirrorz.mirrors.map(async (m) => {
    let t = 0;
    const mapper = new Map();
    m.status.match(/[A-Z](\d+)?/g).map((s) => {
      const c = s[0];
      const t = s.length > 1 ? parseInt(s.substr(1)) : 0;
      mapper.set(c, t);
    });
    for (const c of ['S', 'O', 'F', 'P'])
      if (mapper.has(c) && mapper.get(c) != 0) {
        t = mapper.get(c) - Math.round(cur/1000); // must not equal 0, often less than 0
        break;
      }
    for (const c of [['C', 1000], ['R', 2000]])
      if (mapper.has(c[0]) && t == 0) {
        t = c[1];
        break;
      }
    // special cname, override with lastupdate
    let lastupdate = 0
    if (m.cname in REPO) {
      lastupdate = (await REPO[m.cname](m.url.startsWith("http") ? m.url : mirrorz.site.url + m.url)) - Math.round(cur/1000);
      //console.log(mirrorz.site.url+m.url, lastupdate, t, lastupdate - t)
    }

    const repo = new Point('repo')
      .timestamp(cur)
      .tag('mirror', mirrorz.site.abbr)
      .tag('name', m.cname)
      .tag('url', m.url)
      .tag('lastupdate', lastupdate)
      .intField('value', t);
    points.push(repo)
    //console.log(` ${repo}`);
  }));
  return points
}

async function writeWithTimeout(f) {
  const promise = write(f);
  return Timeout.wrap(promise, timeout, 'Timeout').catch(() => []);
}

async function main() {
  p = [];
  for (const f of LIST)
    p.push(writeWithTimeout(f));
  Promise.all(p).then(async (v) => {
    const points = v.flat();
    //console.log(points.length)
    for (const p of points)
      writeApi.writePoint(p);
    writeApi
      .close()
      .then(() => {
        //console.log('FINISHED')
        process.exit(0);
      })
      .catch(e => {
        if (e instanceof HttpError && e.statusCode === 401) {
          console.log('Should setup a new InfluxDB database.')
        }
        console.log('\nFinished ERROR')
        process.exit(0);
      })
  });
}

main();

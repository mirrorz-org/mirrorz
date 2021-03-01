const jsdom = require("jsdom");
const { JSDOM } = jsdom;
global.DOMParser = new JSDOM().window.DOMParser;

Timeout = require("await-timeout");
const timeout = 30000;

fetch_extra = require("node-fetch-extra");
async function fetchV6First (u, opt) {
  try {
    const promise = fetch_extra(u, {family: 6, ...opt});
    return await Timeout.wrap(promise, timeout/2, 'Timeout');
  } catch (e) {
    const promise = fetch_extra(u, opt);
    return await Timeout.wrap(promise, timeout/2, 'Timeout');
  }
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
  "https://status.tuna.wiki/mirrorz/static/opentuna.json",
  "https://mirrors.ustc.edu.cn/static/json/mirrorz.json",
  "https://mirror.sjtu.edu.cn/mirrorz/siyuan.json",
  "https://mirror.sjtu.edu.cn/mirrorz/zhiyuan.json",
  "https://mirrors.dgut.edu.cn/static/mirrorz.json",
  "https://mirrors.sustech.edu.cn/mirrorz/mirrorz.json",
  "https://iptv.uestc.edu.cn/mirrors/mirrorz.json",
];

const {InfluxDB, Point, HttpError} = require('@influxdata/influxdb-client')

// secret to be filled
const token = ''
const org = ''
const bucket = ''

const writeApi = new InfluxDB({url: '', token}).getWriteApi(org, bucket, 'ns');

const cur = new Date();

async function write(f) {
  let mirrorz;
  if (typeof(f) == "string") {
    const resp = await fetch(f);
    mirrorz = await resp.json();
  } else {
    mirrorz = await f();
  }

  const site = new Point('site')
    .timestamp(cur)
    .tag('mirror', mirrorz.site.abbr)
    .intField('value', 1);
  //console.log(` ${site}`)
  writeApi.writePoint(site);

  mirrorz.mirrors.map((m) => {
    let t = 0;
    const mapper = new Map();
    m.status.match(/[A-Z](\d+)?/g).map((s) => {
      const c = s[0];
      const t = s.length > 1 ? parseInt(s.substr(1)) : 0;
      mapper.set(c, t);
    });
    for (const c of ['S', 'O', 'Y', 'F', 'P'])
      if (mapper.has(c) && mapper.get(c) != 0) {
        t = mapper.get(c) - Math.round(cur/1000);
        break;
      }

    const repo = new Point('repo')
      .timestamp(cur)
      .tag('mirror', mirrorz.site.abbr)
      .tag('name', m.cname)
      .intField('value', t);
    //console.log(` ${repo}`);
    writeApi.writePoint(repo);
  });
}

async function writeWithTimeout(f) {
  const promise = write(f);
  return Timeout.wrap(promise, timeout, 'Timeout');
}

async function main() {
  try {
    p = [];
    for (const f of LIST)
      p.push(writeWithTimeout(f));
    await Promise.all(p);
  } catch (e) {
    //console.log(e)
  }

  writeApi
    .close()
    .then(() => {
      //console.log('FINISHED')
    })
    .catch(e => {
      console.error(e)
      if (e instanceof HttpError && e.statusCode === 401) {
        console.log('Should setup a new InfluxDB database.')
      }
      console.log('\nFinished ERROR')
    })

}

main();

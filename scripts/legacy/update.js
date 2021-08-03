const fs = require("fs");

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
tuna = require("./parser/tuna");
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

const LIST = {
  "lzu"       : lzu,
  "nju"       : nju,
  "neusoft"   : neusoft,
  "hust"      : hust,
  "bfsu"      : bfsu,
  "tuna"      : tuna,
  "hit"       : hit,
  "cqu"       : cqu,
  "xjtu"      : xjtu,
  "zju"       : zju,
  "scau"      : scau,
  "neu"       : neu,
  "nyist"     : nyist,
  "pku"       : pku,
  "byrio"     : byrio,
  "cqupt"     : cqupt,
  "ynuosa"    : ynuosa,
  "xtom"      : xtom,
  "xtom-hk"   : xtom_hk,
  "xtom-de"   : xtom_de,
  "xtom-nl"   : xtom_nl,
  "xtom-ee"   : xtom_ee,
  "njupt"     : njupt,
  // "bjtu"
  // "tongji"
  // x "uestc"
  // x "opentuna"
};

const diff = require("./diff");

async function update(site) {
  filename = '../../static/json/legacy/' + site + '.json';
  let o
  try {
    o = JSON.parse(fs.readFileSync(filename));
  } catch (e) {
    // fallback to empty one
    o = { site: {}, info: [], mirrors: [] }
  }
  let n;
  if (typeof(LIST[site]) == "string") {
    const resp = await fetch(LIST[site]);
    if (resp === null)
      return `${site}: fetch failed\n`
    n = await resp.json();
  } else {
    n = await Timeout.wrap(LIST[site](), timeout, 'Timeout').catch(() => null);
    if (n === null)
      return `${site}: fetch failed\n`
  }
  d = diff(o, n)
  if (d !== "") {
    fs.writeFileSync(filename, JSON.stringify(n, null, 2));
    return `${site}: update\n${d}`
  }
  return `${site}: same\n`
}

async function main() {
  for (site in LIST) {
    d = await update(site);
    console.log(d)
  }
  process.exit(0);
}

main();

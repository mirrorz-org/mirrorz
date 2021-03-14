const lzu = require("./../parser/lzu");
const nju = require("./../parser/nju");
const neusoft = require("./../parser/neusoft");
const hust = require("./../parser/hust");
const tuna = require("./../parser/tuna");
const bfsu = require("./../parser/bfsu");
const nano = require("./../parser/nano");
const neo = require("./../parser/neo");
const hit = require("./../parser/hit");
const cqu = require("./../parser/cqu");
//const xjtu = require("./../parser/xjtu");
//const neu = require("./../parser/neu");
const nyist = require("./../parser/nyist");

module.exports = [
  "https://status.tuna.wiki/mirrorz/static/opentuna.json",
  "https://mirrors.ustc.edu.cn/static/json/mirrorz.json",
  "https://mirror.sjtu.edu.cn/mirrorz/siyuan.json",
  "https://mirror.sjtu.edu.cn/mirrorz/zhiyuan.json",
  "https://mirrors.dgut.edu.cn/static/mirrorz.json",
  "https://mirrors.sustech.edu.cn/mirrorz/mirrorz.json",
  "https://iptv.uestc.edu.cn/mirrors/mirrorz.json",
  "https://mirrorz.org/static/tmp/bjtu.json",
  "https://mirrorz.org/static/tmp/njupt.json",
  "https://mirrorz.org/static/tmp/xjtu.json",
  "https://mirrorz.org/static/tmp/tongji.json",
  "https://mirrorz.org/static/tmp/neu.json",
  lzu,
  nju,
  neusoft,
  hust,
  tuna,
  bfsu,
  nano,
  neo,
  hit,
  cqu,
  nyist,
]

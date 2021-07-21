import { Parser } from "../parser";
import lzu from "./../parser/lzu";
import nju from "./../parser/nju";
import neusoft from "./../parser/neusoft";
import hust from "./../parser/hust";
import tuna from "./../parser/tuna";
import bfsu from "./../parser/bfsu";
import nano from "./../parser/nano";
import neo from "./../parser/neo";
import hit from "./../parser/hit";
import cqu from "./../parser/cqu";
import xjtu from "./../parser/xjtu";
//const neu = require("./../parser/neu");
import nyist from "./../parser/nyist";
import scau from "./../parser/scau";
import zju from "./../parser/zju";
import pku from "./../parser/pku";
import byrio from "./../parser/byrio";
import cqupt from "./../parser/cqupt";
import ynuosa from "./../parser/ynuosa";
import xtom_hk from "../parser/xtom-hk";
import xtom from "../parser/xtom";

const upstreams: (string | Parser)[] = [
  "https://status.tuna.wiki/mirrorz/static/opentuna.json",
  "https://mirrors.ustc.edu.cn/static/json/mirrorz.json",
  "https://mirror.sjtu.edu.cn/mirrorz/siyuan.json",
  "https://mirror.sjtu.edu.cn/mirrorz/zhiyuan.json",
  "https://mirrors.dgut.edu.cn/static/mirrorz.json",
  "https://mirrors.sustech.edu.cn/mirrorz/mirrorz.json",
  "https://iptv.uestc.edu.cn/mirrors/mirrorz.json",
  "https://mirrors.nwafu.edu.cn/api/mirrorz/info.json",
  "https://mirrorz.org/static/json/legacy/bjtu.json",
  "https://mirrorz.org/static/json/legacy/njupt.json",
  "https://mirrorz.org/static/json/legacy/tongji.json",
  "https://mirrorz.org/static/json/legacy/neu.json",
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
  scau,
  zju,
  pku,
  byrio,
  cqupt,
  ynuosa,
  xjtu,
  xtom_hk,
  xtom,
];

export default upstreams;

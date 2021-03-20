const tunasync = require("./tunasync");
const options = require("./options");
const isoinfo = require("./isoinfo");

module.exports = async function () {
  const site = await (await fetch("https://mirrorz.org/static/json/site/tuna.json")).json();
  let mirrors = await tunasync("https://mirrors.tuna.tsinghua.edu.cn/static/tunasync.json");
  mirrors = await options("https://mirrors.tuna.tsinghua.edu.cn/static/js/options.json", mirrors);
  info = await isoinfo("https://mirrors.tuna.tsinghua.edu.cn/static/status/isoinfo.json");

  return {
    site,
    info,
    mirrors,
  }
};

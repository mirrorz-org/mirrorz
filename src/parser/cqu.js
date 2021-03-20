const tunasync = require("./tunasync");
const isoinfo = require("./isoinfo");

module.exports = async function () {
  const site = await (await fetch("https://mirrorz.org/static/json/site/cqu.json")).json();
  const mirrors = await tunasync("https://mirrors.cqu.edu.cn/static/tunasync.json");
  const info = await isoinfo("https://mirrors.cqu.edu.cn/static/isoinfo.json");

  return {
    site,
    info,
    mirrors,
  }
};

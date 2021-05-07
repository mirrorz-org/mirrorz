const tunasync = require("./tunasync");
const options = require("./options");
const isoinfo = require("./isoinfo");
const disk = require("./disk");

module.exports = async function () {
  const site = await (await fetch("https://mirrorz.org/static/json/site/bfsu.json")).json();
  site["disk"] = await disk("https://mirrors.bfsu.edu.cn/static/status/disk.json");

  let mirrors = await tunasync("https://mirrors.bfsu.edu.cn/static/tunasync.json");
  mirrors = await options("https://mirrors.bfsu.edu.cn/static/js/options.json", mirrors);
  info = await isoinfo("https://mirrors.bfsu.edu.cn/static/status/isoinfo.json");

  return {
    site,
    info,
    mirrors,
  }
};

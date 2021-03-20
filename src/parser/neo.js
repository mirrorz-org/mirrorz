const tunasync = require("./tunasync");
const options = require("./options");
const disk = require("./disk");

module.exports = async function () {
  const site = await (await fetch("https://mirrorz.org/static/json/site/neo.json")).json();
  site["disk"] = await disk("https://mirrors.tuna.tsinghua.edu.cn/static/status/neo/disk.json")

  let mirrors = await tunasync("https://mirrors.tuna.tsinghua.edu.cn/static/tunasync.json.neo");
  mirrors = await options("https://mirrors.tuna.tsinghua.edu.cn/static/js/options.json", mirrors);

  return {
    site,
    info: [],
    mirrors,
  }
};

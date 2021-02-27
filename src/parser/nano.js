const cname = require("./utils").cname;
const tunasync = require("./tunasync");
const options = require("./options");
const disk = require("./disk");

module.exports = async function () {
  const name_func = await cname();
  const site = await (await fetch("https://mirrorz.org/static/json/site/nano.json")).json();
  site["disk"] = await disk("https://mirrors.tuna.tsinghua.edu.cn/static/status/nano/disk.json")

  let mirrors = await tunasync("https://mirrors.tuna.tsinghua.edu.cn/static/tunasync.json.nano");
  mirrors = await options("https://mirrors.tuna.tsinghua.edu.cn/static/js/options.json", mirrors);

  return {
    site,
    info: [],
    mirrors,
  }
};

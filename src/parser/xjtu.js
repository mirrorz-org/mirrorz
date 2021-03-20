const tunasync = require("./tunasync");

module.exports = async function () {
  const site = await (await fetch("https://mirrorz.org/static/json/site/xjtu.json")).json();
  const mirrors = await tunasync("https://mirrors.xjtu.edu.cn/api/status.json");

  return {
    site,
    info: [],
    mirrors,
  }
};

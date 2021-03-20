const tunasync = require("./tunasync");

module.exports = async function () {
  const site = await (await fetch("https://mirrorz.org/static/json/site/hit.json")).json();
  const mirrors = await tunasync("https://mirrors.hit.edu.cn/jobs");

  return {
    site,
    info: [],
    mirrors,
  }
};

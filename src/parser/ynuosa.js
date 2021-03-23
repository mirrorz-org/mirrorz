const tunasync = require("./tunasync");

module.exports = async function () {
  const site = await (await fetch("https://mirrorz.org/static/json/site/ynuosa.json")).json();
  const mirrors = await tunasync("https://mirrors.ynu.edu.cn/jobs");

  return {
    site,
    info: [],
    mirrors,
  }
};

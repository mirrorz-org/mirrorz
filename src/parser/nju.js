const tunasync = require("./tunasync");
const options = require("./options");

module.exports = async function () {
  const site = await (await fetch("https://mirrors.nju.edu.cn/.mirrorz/site.json")).json();
  const mirrors = await tunasync("https://mirrors.nju.edu.cn/.mirrorz/tunasync.json");

  return {
    site,
    info: [],
    mirrors,
  }
};

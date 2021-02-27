const cname = require("./utils").cname;
const tunasync = require("./tunasync");
const options = require("./options");

module.exports = async function () {
  const name_func = await cname();
  const site = await (await fetch("https://mirrors.nju.edu.cn/.mirrorz/site.json")).json();
  const mirrors = await tunasync("https://mirrors.nju.edu.cn/.mirrorz/tunasync.json");

  return {
    site,
    info: [],
    mirrors,
  }
};

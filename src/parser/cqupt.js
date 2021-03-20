const tunasync = require("./tunasync");

module.exports = async function () {
  const site = await (await fetch("https://mirrorz.org/static/json/site/cqupt.json")).json();
  const mirrors = await tunasync("https://mirrors.redrock.team/static/tunasync.json");

  return {
    site,
    info: [],
    mirrors,
  }
};

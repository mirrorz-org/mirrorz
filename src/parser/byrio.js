const tunasync = require("./tunasync");

module.exports = async function () {
  const site = await (await fetch("https://mirrorz.org/static/json/site/byrio.json")).json();
  const mirrors = await tunasync("https://mirrors.byrio.org/static/tunasync.json");

  return {
    site,
    info: [],
    mirrors,
  }
};

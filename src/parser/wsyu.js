const isoinfo = require("./isoinfo");

module.exports = async function () {
  const mirrorz = await (await fetch("https://mirrors.wsyu.edu.cn/.mirrorz/mirrorz.json")).json();
  site = mirrorz["site"];
  mirrors = mirrorz["mirrors"];
  info = await isoinfo("https://mirrors.wsyu.edu.cn/.mirrorz/info.json");

  return {
    site,
    info,
    mirrors,
  }
};

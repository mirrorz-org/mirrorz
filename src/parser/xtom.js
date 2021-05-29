const ustclugv1 = require("./ustclug-v1");

module.exports = async function () {
  const site = await (
    await fetch("http://localhost:1234/static/json/site/xtom.json")
  ).json();
  const info = await ustclugv1(
    "https://r.zenithal.workers.dev/http://mirror.ustc.edu.cn/",
    "https://admin.mirrors.ustc.edu.cn/api/v1/metas"
  );

  return {
    site,
    info,
  };
};

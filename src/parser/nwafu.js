const cname = require("./utils").cname;

const statusConverter = function(r, s, t) {
  let c = undefined;
  if (r)
    c = "Y"
  else if (s)
    c = "S"
  else
    c = "F"

  if (c == undefined || c == "U")
    return "U";
  const n = Math.round(new Date(t).getTime()/1000).toString();
  if (c == "S" || c == "F")
    return c + n;
  else
    return c + "O" + n;
};

module.exports = async function () {
  const name_func = await cname();
  const site = await (await fetch("https://mirrorz.org/static/json/site/nwafu.json")).json();
  const data = (await (await fetch("https://r.zenithal.workers.dev/https://mirrors.nwsuaf.edu.cn/api/mirrors_stat")).json()).data;

  const mirrors = [];
  for (k in data) {
    const cname = name_func(k)
    const url = "/" + k;
    mirrors.push({
      cname,
      url,
      status: statusConverter(data[k].Running, data[k].Success, data[k].FinishedAt)
    })
  }

  return {
    site,
    info: [],
    mirrors,
  }
};

const cname = require("./utils").cname;

const MAP = {
  done: "S",
  sync: "Y",
  error: "F",
};

const statusConverter = function(item) {
  const c = MAP[item.state] ?? "U";
  const last = Math.round(new Date(item.lastSyncTime).getTime()/1000).toString();
  const next = Math.round(new Date(item.nextSyncTime).getTime()/1000).toString();
  if (c == "S")
    return c + last + "X" + next;
  else
    return c + "O" + last + "X" + next;
};

module.exports = async function () {
  const name_func = await cname();
  const site = await (await fetch("https://mirrorz.org/static/json/site/pku.json")).json();
  const stat = await (await fetch("https://mirrors.pku.edu.cn/monitor/status")).json();

  const mirrors = stat.map((item) => {
    const mirror = {
      cname: name_func(item.id),
      url: "/" + item.id,
      status: statusConverter(item),
    }
    if ("diskUsage" in item && item.diskUsage !== "")
      mirror["size"] = item.diskUsage;
    return mirror;
  }).filter((e) => e !== null);

  return {
    site,
    info: [],
    mirrors,
  }
};

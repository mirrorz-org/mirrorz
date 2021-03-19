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

const human = function(size) {
  const scale = ["GiB", "TiB", "PiB"];
  let i = 0;
  while (size > 1024) {
    size /= 1024;
    i += 1;
  }
  return size.toFixed(2) + scale[i];
}

module.exports = async function () {
  const name_func = await cname();
  const site = await (await fetch("https://mirrorz.org/static/json/site/pku.json")).json();
  const disk = await (await fetch("https://mirrors.pku.edu.cn/monitor_device/api/v1/data?chart=disk_space._data&after=-1&before=0&points=1&group=average&gtime=0&format=json&options=seconds&options=jsonwrap")).json();
  site.disk = human(disk.latest_values[1]) + "/" + human(disk.latest_values[0] + disk.latest_values[1]);

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

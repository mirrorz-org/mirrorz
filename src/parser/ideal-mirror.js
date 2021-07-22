const cname = require("./utils").cname;

const human = function(size) {
  const scale = ["B", "KiB", "MiB", "GiB", "TiB"];
  let i = 0;
  while (size > 1024) {
    size /= 1024;
    i += 1;
  }
  return size.toFixed(2) + scale[i];
}

module.exports = async function (mirrordURL) {
  const name_func = await cname();
  const mirrord = await (await fetch(mirrordURL)).json();

  mirrors = [];
  for (let mirror in mirrord) {
    d = mirrord[mirror]
    m = {
      cname: name_func(mirror),
      url: "/" + mirror,
    };
    if ("upstream" in d)
      m["upstream"] = d.upstream;

    dateTimestamp = parseInt((new Date(d.date + " UTC+8").getTime() / 1000).toFixed(0)).toString()
    scheduleTimestamp = parseInt((new Date(d.schedule + " UTC+8").getTime() / 1000).toFixed(0)).toString()

    if (d.status == 2 && d.exitcode == 0)
      m["status"] = "S" + dateTimestamp
    else if (d.status == 2 && d.exitcode != 0)
      m["status"] = "F" + dateTimestamp
    else if (d.status == 1 && d.exitcode == 0)
      m["status"] = "Y" + dateTimestamp
    else
      m["status"] = "U"
    m["status"] += "X" + scheduleTimestamp
    if ("size" in d && d.size != 0)
      m["size"] = human(parseInt(d.size))
    mirrors.push(m);
  }
  return mirrors
}

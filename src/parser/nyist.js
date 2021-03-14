const cname = require("./utils").cname;

const MAP = {
  success: "S",
  syncing: "Y",
  unknown: "U",
  fail: "F",
  failed: "F",
}

const statusConverter = function(time, status) {
  const c = MAP[status];
  if (c === undefined)
    return "U";
  if (time == "-")
    return c;
  const t = Math.round(new Date(time + " UTC+8").getTime()/1000).toString();
  if (c == "S")
    return c + t;
  else
    return c + "O" + t;
};

module.exports = async function () {
  const name_func = await cname();
  const site = await (await fetch("https://mirrorz.org/static/json/site/nyist.json")).json();
  const html = await (await fetch("https://r.zenithal.workers.dev/https://mirror.nyist.edu.cn/")).text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const items = Array.from(doc.querySelectorAll(".container tbody tr"));
  const mirrors = items.map((item) => {
    const data = Array.from(item.querySelectorAll("td"));
    if (data[0].firstElementChild === null) // table header
      return null
    const name = name_func(data[0].firstElementChild.textContent);
    const url = data[0].firstElementChild.getAttribute("href");
    const time = data[1].textContent;
    const size = data[2].textContent;
    const status = data[4].firstElementChild.textContent;
    return {
      cname: name,
      url,
      status: statusConverter(time, status),
      size,
    }
  }).filter((e) => e !== null);

  return {
    site,
    info: [],
    mirrors,
  }
};

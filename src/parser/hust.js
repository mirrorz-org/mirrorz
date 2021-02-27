const cname = require("./utils").cname;

const MAP = {
  Synchronized: "S",
  Failed: "F",
}

const statusConverter = function(time, status) {
  const c = MAP[status];
  if (c === undefined)
    return "U";

  const t = Math.round(new Date(time + " UTC+8").getTime()/1000).toString();
  if (c == "S")
    return c + t;
  else
    return c + "O" + t;
};

module.exports = async function () {
  const name_func = await cname();
  const site = await (await fetch("https://mirrorz.org/static/json/site/hust.json")).json();
  const html = await (await fetch("https://r.zenithal.workers.dev/http://mirror.hust.edu.cn/")).text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const items = Array.from(doc.querySelectorAll("#mirror-tbody tr"));
  const mirrors = items.map((item) => {
    const data = Array.from(item.querySelectorAll("td"));
    const name = name_func(data[0].firstElementChild.innerText);
    const url = '/' +  data[0].firstElementChild.getAttribute("href");
    const size = data[1].innerText;
    const status = data[2].innerText;
    let time = new Date().getFullYear().toString() + " " + data[3].innerText;
    // for example, given November but it's February, we need one year earlier
    if (new Date(time) > new Date())
      time = (new Date().getFullYear() - 1).toString() + " " + data[3].innerText;
    return {
      cname: name,
      url,
      size,
      status: statusConverter(time, status)
    }
  });

  return {
    site,
    info: [],
    mirrors,
  }
};

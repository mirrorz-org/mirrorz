import { cname } from "./utils";

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

export default async function () {
  const name_func = await cname();
  const site = await (await fetch("/static/json/site/lzu.json")).json();
  const html = await (await fetch("https://r.zenithal.workers.dev/http://mirror.lzu.edu.cn/")).text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const items = Array.from(doc.querySelectorAll(".mirror_list tbody tr"));
  const mirrors = items.map((item) => {
    const data = Array.from(item.querySelectorAll("td"));
    const name = name_func(data[0].firstElementChild.innerText);
    const url = data[0].firstElementChild.getAttribute("href");
    const time = data[1].innerText;
    const status = data[2].innerText;
    return {
      cname: name,
      url,
      status: statusConverter(time, status)
    }
  });

  return {
    site,
    info: [],
    mirrors,
  }
};

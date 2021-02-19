import { cname } from "./utils";

export default async function () {
  const name_func = await cname();
  const site = await (await fetch("/static/json/site/nju.json")).json();
  const html = await (await fetch("https://r.nichi.co/https://mirrors.nju.edu.cn/")).text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const items = Array.from(doc.querySelector("pre").children);
  const mirrors = items.map((item) => {
    if (item.innerText == "../" || !item.innerText.endsWith('/'))
      return null;
    const cname = name_func(item.innerText.slice(0, -1));
    const url = item.getAttribute("href");
    return {
      cname,
      url,
    }
  }).filter((e) => e !== null);

  return {
    site,
    info: [],
    mirrors,
  }
};

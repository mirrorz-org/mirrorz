const cname = require("./utils").cname;

const statusConverter = function(status) {
  if (status === null)
    return "U";
  let t;
  if (status.split(' ')[0] === "This") // see https://github.com/zjulug/simple-mirrors-monitor/blob/master/compare.py
    t = parseFloat(status.split(' ')[7])
  else
    t = parseFloat(status.split(' ')[3])
  // see https://github.com/zjulug/simple-mirrors-monitor/blob/master/compare.py
  const n = Math.round(new Date(new Date() - t*60*60*1000).getTime()/1000).toString();
  return "S" + n;
};


module.exports = async function () {
  const name_func = await cname();
  const site = await (await fetch("https://mirrorz.org/static/json/site/zju.json")).json();
  const html = await (await fetch("https://r.zenithal.workers.dev/https://mirrors.zju.edu.cn/")).text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const items = Array.from(doc.querySelectorAll("#list .dl-horizontal dt"));
  const descs = Array.from(doc.querySelectorAll("#list .dl-horizontal dd"));
  // https://stackoverflow.com/questions/22015684/how-do-i-zip-two-arrays-in-javascript
  const zip = (a, b) => a.map((k, i) => [k, b[i]]);
  const mirrors = zip(items, descs).map(([dt, dd]) => {
    const url = dt.firstElementChild.getAttribute("href");
    const status = dt.firstElementChild.getAttribute("title");
    const name = name_func(url.substr(1));
    const desc = dd.textContent;
    return {
      cname: name,
      url,
      status: statusConverter(status),
      desc,
    }
  });

  return {
    site,
    info: [],
    mirrors,
  }
};

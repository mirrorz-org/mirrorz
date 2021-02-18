import { cname } from "./utils";

const statusConverter = function(time, status) {
  let c = undefined;
  if (status == 0)
    c = "S"
  else if (status == -1)
    c = "Y"
  else if (status == -2)
    c = "U"
  else
    c = "F"

  if (c == undefined || c == "U")
    return "U";
  const t = Math.round(new Date(time).getTime()/1000).toString();
  if (c == "S")
    return c + t;
  else
    return c + "O" + t;
};

const human = function(size) {
  const scale = ["B", "K", "M", "G", "T"];
  let i = 0;
  while (size > 1024) {
    size /= 1024;
    i += 1;
  }
  return size.toFixed(2) + scale[i];
}

export default async function () {
  const name_func = await cname();
  const site = await (await fetch("/static/json/site/neusoft.json")).json();
  const repos = await (await fetch("https://r.nichi.co/http://mirrors.neusoft.edu.cn/repos.html")).json();

  const mirrors = [];
  for (k in repos) {
    const cname = name_func(k)
    const url = "/" + k;
    const size = human(repos[k].size);
    mirrors.push({
      cname,
      url,
      size,
      status: statusConverter(repos[k].time, repos[k].status)
    })
  }

  return {
    site,
    info: [],
    mirrors,
  }
};

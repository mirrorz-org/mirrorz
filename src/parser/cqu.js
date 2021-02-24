import { cname } from "./utils";
import tunasync from "./tunasync";
import isoinfo from "./isoinfo";

export default async function () {
  const name_func = await cname();
  const site = await (await fetch("/static/json/site/cqu.json")).json();
  const mirrors = await tunasync("https://r.zenithal.workers.dev/https://mirrors.cqu.edu.cn/static/tunasync.json");
  const info = await isoinfo("https://r.zenithal.workers.dev/https://mirrors.cqu.edu.cn/static/isoinfo.json");

  return {
    site,
    info,
    mirrors,
  }
};

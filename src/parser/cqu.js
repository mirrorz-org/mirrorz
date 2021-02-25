import { cname } from "./utils";
import tunasync from "./tunasync";
import isoinfo from "./isoinfo";

export default async function () {
  const name_func = await cname();
  const site = await (await fetch("/static/json/site/cqu.json")).json();
  const mirrors = await tunasync("https://mirrors.cqu.edu.cn/static/tunasync.json");
  const info = await isoinfo("https://mirrors.cqu.edu.cn/static/isoinfo.json");

  return {
    site,
    info,
    mirrors,
  }
};

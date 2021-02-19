import { cname } from "./utils";
import tunasync from "./tunasync";
import options from "./options";
import isoinfo from "./isoinfo";

export default async function () {
  const name_func = await cname();
  const site = await (await fetch("/static/json/site/bfsu.json")).json();
  let mirrors = await tunasync("https://mirrors.bfsu.edu.cn/static/tunasync.json");
  mirrors = await options("https://mirrors.bfsu.edu.cn/static/js/options.json", mirrors);
  info = await isoinfo("https://mirrors.bfsu.edu.cn/static/status/isoinfo.json");

  return {
    site,
    info,
    mirrors,
  }
};

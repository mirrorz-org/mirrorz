import { cname } from "./utils";
import tunasync from "./tunasync";
import options from "./options";
import isoinfo from "./isoinfo";
import disk from "./disk";

export default async function () {
  const name_func = await cname();
  const site = await (await fetch("/static/json/site/nano.json")).json();
  site["disk"] = await disk("https://mirrors.tuna.tsinghua.edu.cn/static/status/neo/disk.json")

  let mirrors = await tunasync("https://mirrors.tuna.tsinghua.edu.cn/static/tunasync.json.neo");
  mirrors = await options("https://mirrors.tuna.tsinghua.edu.cn/static/js/options.json", mirrors);

  info = await isoinfo("https://mirrors.tuna.tsinghua.edu.cn/static/status/neo/isoinfo.json");

  return {
    site,
    info,
    mirrors,
  }
};

import { cname } from "./utils";
import tunasync from "./tunasync";
import options from "./options";
import disk from "./disk";

export default async function () {
  const name_func = await cname();
  const site = await (await fetch("/static/json/site/neo.json")).json();
  site["disk"] = await disk("https://mirrors.tuna.tsinghua.edu.cn/static/status/neo/disk.json")

  let mirrors = await tunasync("https://mirrors.tuna.tsinghua.edu.cn/static/tunasync.json.neo");
  mirrors = await options("https://mirrors.tuna.tsinghua.edu.cn/static/js/options.json", mirrors);

  return {
    site,
    info: [],
    mirrors,
  }
};

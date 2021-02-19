import { cname } from "./utils";
import tunasync from "./tunasync";
import options from "./options";
import isoinfo from "./isoinfo";
import disk from "./disk";

export default async function () {
  const name_func = await cname();
  const site = await (await fetch("/static/json/site/nano.json")).json();
  site["disk"] = await disk("https://nanomirrors.tuna.tsinghua.edu.cn/static/status/disk.json")

  let mirrors = await tunasync("https://nanomirrors.tuna.tsinghua.edu.cn/static/tunasync.json");
  mirrors = await options("https://nanomirrors.tuna.tsinghua.edu.cn/static/js/options.json", mirrors);

  info = await isoinfo("https://nanomirrors.tuna.tsinghua.edu.cn/static/status/isoinfo.json");

  return {
    site,
    info,
    mirrors,
  }
};

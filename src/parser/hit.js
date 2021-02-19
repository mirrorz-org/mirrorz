import { cname } from "./utils";
import tunasync from "./tunasync";
import options from "./options";
import isoinfo from "./isoinfo";

export default async function () {
  const name_func = await cname();
  const site = await (await fetch("/static/json/site/hit.json")).json();
  let mirrors = await tunasync("https://mirrors.hit.edu.cn/jobs");

  return {
    site,
    info: [],
    mirrors,
  }
};

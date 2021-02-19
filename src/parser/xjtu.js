import { cname } from "./utils";
import tunasync from "./tunasync";

export default async function () {
  const name_func = await cname();
  const site = await (await fetch("/static/json/site/xjtu.json")).json();
  const mirrors = await tunasync("https://r.nichi.co/https://mirrors.xjtu.edu.cn/api/status.json");

  return {
    site,
    info: [],
    mirrors,
  }
};

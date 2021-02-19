import { cname } from "./utils";
import tunasync from "./tunasync";
import options from "./options";

export default async function () {
  const name_func = await cname();
  const site = await (await fetch("https://mirrors.nju.edu.cn/.mirrorz/site.json")).json();
  const mirrors = await tunasync("https://mirrors.nju.edu.cn/.mirrorz/tunasync.json");

  return {
    site,
    info: [],
    mirrors,
  }
};

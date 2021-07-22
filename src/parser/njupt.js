const ideal_mirror = require("./ideal-mirror");
const isoinfo = require("./isoinfo");

module.exports = async function () {
  const site = await (await fetch("https://mirrorz.org/static/json/site/njupt.json")).json();
  const info = await isoinfo("https://mirrors.njupt.edu.cn/isoinfo.json");
  let mirrors = await ideal_mirror("https://mirrors.njupt.edu.cn/mirrordsync.json");

  for (const m of mirrors) {
    m["help"] = "/help" + m.url;
  }

  // ad-hoc modification from https://mirrors.njupt.edu.cn/static/js/index.js
  mirrors.push({
    cname: "maven",
    url: "https://mirrors.njupt.edu.cn/help/maven/",
    upstream: "https://repo1.maven.org/maven2/",
    status: "C",
  });
  mirrors.push({
    cname: "npm",
    url: "https://mirrors.njupt.edu.cn/help/npm/",
    upstream: "https://registry.npmjs.org",
    status: "C",
  });
  mirrors.push({
    cname: "pypi",
    url: "https://mirrors.njupt.edu.cn/help/pypi/",
    upstream: "https://pypi.python.org/",
    status: "C",
  });
  mirrors.push({
    cname: "rubygems",
    url: "https://mirrors.njupt.edu.cn/help/rubygems/",
    upstream: "https://rubygems.org",
    status: "C",
  });

  return {
    site,
    info,
    mirrors,
  }
};

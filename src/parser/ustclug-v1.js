const cname = require("./utils").cname;

const size = function (bytes) {
  mib = bytes / 1024 / 1024;
  if (mib < 1024) {
    return mib.toFixed(2) + " MiB";
  }
  gib = mib / 1024;
  if (gib < 1024) {
    return gib.toFixed(2) + " GiB";
  }
  tib = gib / 1024;
  return tib.toFixed(2) + " TiB";
};

module.exports = async function (homepageURL, yukiURL) {
  const name_func = await cname();
  homepageHTML = await (await fetch(homepageURL)).text();
  // yukiMeta = await (await fetch(yukiURL)).json();
  yukiMeta = await fetch(yukiURL);
  if (yukiMeta.ok) {
    yukiMeta = await yukiMeta.json();
  } else {
    yukiMeta = null;
  }

  // finding `var isoinfo`
  const htmlLines = homepageHTML.split("\n");
  const isoSign = "var isoinfo = ";
  let isoinfo = [];
  for (let line of htmlLines) {
    let pos = line.indexOf(isoSign);
    if (pos !== -1) {
      pos += isoSign.length;
      isoinfo = JSON.parse(line.substring(pos, line.length - 1));
    }
  }
  for (let item of isoinfo) {
    item["category"] = "os";
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(homepageHTML, "text/html");
  const items = Array.from(doc.querySelectorAll(".filelist tbody tr"));

  // handling HTML
  const hashtable = {};
  const mirrors = items.map((item, index) => {
    let url = item.querySelector(".filename a").getAttribute("href");
    if (!url.startsWith("http:") && !url.startsWith("https:")) {
      url = "/" + url;
    }
    const status = "U";
    const help = item.querySelector(".help a").getAttribute("href");
    const name = name_func(url.replace(/\//g, "")); // remove all '/' in href
    const desc = ""; // no desc in ustclug-v1
    hashtable[name.toLowerCase()] = index;
    return {
      cname: name,
      url,
      status,
      help,
      desc,
    };
  });

  // handling yuki
  if (yukiMeta) {
    yukiMeta.map((item) => {
      const name = name_func(item.name).toLowerCase();
      const index = hashtable[name] ?? hashtable[name.split(".")[0]];
      if (index === undefined) {
        return;
      }
      const next_run = item.nextRun;
      const last_success = item.lastSuccess;
      const prev_run = item.prevRun;
      if (next_run < 0) {
        mirrors[index]["status"] = "P";
      } else if (item.syncing) {
        mirrors[index]["status"] = "Y" + prev_run;
        if (last_success) {
          mirrors[index]["status"] += "O" + last_success;
        }
      } else if (item.exitCode == 0) {
        mirrors[index]["status"] = "S" + last_success;
      } else {
        mirrors[index]["status"] = "F" + prev_run;
        if (last_success) {
          mirrors[index]["status"] += "O" + last_success;
        }
      }
      if (next_run > 0) {
        mirrors[index]["status"] += "X" + next_run;
      }
      mirrors[index]["size"] = size(item.size);
      mirrors[index]["upstream"] = item.upstream;
    });
  }

  return {
    info: isoinfo,
    mirrors,
  };
};

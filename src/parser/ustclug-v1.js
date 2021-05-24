const cname = require("./utils").cname;

const size = function(bytes) {
  mib = bytes / 1024 / 1024;
  if (mib < 1024) {
    return mib + " MiB";
  }
  gib = mib / 1024;
  if (gib < 1024) {
    return gib + " GiB";
  }
  tib = gib / 1024;
  return tib + " TiB";
}

module.exports = async function (homepageURL, yukiURL) {
  // TODO: missing isoinfo.
  const name_func = await cname();
  homepageHTML = await (await fetch(homepageURL)).text();
  yukiMeta = await (await fetch(yukiURL)).json();

  const parser = new DOMParser();
  const doc = parser.parseFromString(homepageHTML, 'text/html');
  const items = Array.from(doc.querySelectorAll(".filelist tbody tr"));

  // handling HTML
  const hashtable = {};
  const mirrors = items.map((item, index) => {
    const url = item.querySelector(".filename a").getAttribute("href");
    const status = "U";
    const help = item.querySelector(".help a").getAttribute("href");
    const name = name_func(url.replace(/\//g, ''))  // remove all '/' in href
    const desc = "";  // no desc in ustclug-v1
    hashtable[name.toLowerCase()] = index;
    return {
      cname: name,
      url,
      status,
      help,
      desc,
    }
  });

  // handling yuki
  yukiMeta.map((item) => {
    const name = name_func(item.name).toLowerCase();
    const index = hashtable[name] ?? hashtable[name.split(".")[0]];
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
  })

  return mirrors
}
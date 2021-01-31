/**
 * Example someHost is set up to take in a JSON request
 * Replace url with the host you wish to send requests to
 * @param {string} someHost the host to send the request to
 * @param {string} url the URL to send the request to
 */

function generateURLs(params) {
  const tuna = {
    site: "https://www.mirrorz.org/static/json/site/tuna.json",
    tunasync: "https://mirrors.tuna.tsinghua.edu.cn/static/tunasync.json",
    info: "https://mirrors.tuna.tsinghua.edu.cn/static/status/isoinfo.json",
    options: "https://www.mirrorz.org/static/json/options.json",
    cname: "https://www.mirrorz.org/static/json/cname.json",
  };
  const nano = {
    site: "https://www.mirrorz.org/static/json/site/nano.json",
    tunasync: "https://nanomirrors.tuna.tsinghua.edu.cn/static/tunasync.json",
    info: "https://nanomirrors.tuna.tsinghua.edu.cn/static/status/isoinfo.json",
    options: "https://www.mirrorz.org/static/json/options.json",
    cname: "https://www.mirrorz.org/static/json/cname.json",
  };
  const neo = {
    site: "https://www.mirrorz.org/static/json/site/neo.json",
    tunasync: "https://neomirrors.tuna.tsinghua.edu.cn/static/tunasync.json",
    info: "https://neomirrors.tuna.tsinghua.edu.cn/static/status/isoinfo.json",
    options: "https://www.mirrorz.org/static/json/options.json",
    cname: "https://www.mirrorz.org/static/json/cname.json",
  };
  const bfsu = {
    site: "https://www.mirrorz.org/static/json/site/bfsu.json",
    tunasync: "https://mirrors.bfsu.edu.cn/static/tunasync.json",
    info: "https://mirrors.bfsu.edu.cn/static/status/isoinfo.json",
    options: "https://www.mirrorz.org/static/json/options.json",
    cname: "https://www.mirrorz.org/static/json/cname.json",
  };
  const opentuna = {
    site: "https://www.mirrorz.org/static/json/site/opentuna.json",
    tunasync: "https://opentuna/static/jobs",
    info: "",
    options: "https://www.mirrorz.org/static/json/options.json",
    cname: "https://www.mirrorz.org/static/json/cname.json",
  };
  if ("nano" in params) {
    return nano;
  }
  if ("neo" in params) {
    return neo;
  }
  if ("bfsu" in params) {
    return bfsu;
  }
  if ("opentuna" in params) {
    return opentuna;
  }
  return tuna;
}

function name(n, cname) {
  if (n in cname) {
    return cname[n];
  } else {
    return n;
  }
}

function stat(mirror) {
  const d = {
    success: "S",
    syncing: "Y",
    unknown: "U",
    failed: "F",
    fail: "F",
    paused: "P",
  };
  if ("status" in mirror && mirror["status"] in d) {
    return d[mirror["status"]];
  } else {
    return "U";
  }
}

function help(name, options) {
  var l = "";
  options["helps"].forEach((h) => {
    if (h["mirrorid"] == name) {
      l = h["url"];
    }
  });
  return l;
}

function desc(name, options) {
  var s = "";
  options["options"]["mirror_desc"].forEach((h) => {
    if (h["name"] == name) {
      s = h["desc"];
    }
  });
  return s;
}

function upstream(mirror, tunasync) {
  var s = "";
  if ("upstream" in mirror) {
    return mirror["upstream"];
  } else if ("link_to" in mirror) {
    tunasync.forEach((sync) => {
      if (sync["name"] == mirror["link_to"]) {
        s = upstream(sync, tunasync);
      }
    });
  }
  return s;
}

async function getJSON(url) {
  if (url == "") return {};
  const meta = {
    headers: {
      "x-mirrorz": "tuna.zenithal.workers.dev",
    },
    method: "GET",
  };
  return await (await fetch(url, meta)).json();
}

async function handleRequest(request) {
  const params = {};
  const req_url = new URL(request.url);
  const queryString = req_url.search.slice(1).split("&");
  queryString.forEach((item) => {
    const kv = item.split("=");
    if (kv[0]) {
      if (kv[0] in params) {
        params[kv[0]].push(kv[1] || true);
      } else {
        params[kv[0]] = [kv[1] || true];
      }
    }
  });

  const urls = generateURLs(params);

  let [site, tunasync, info, options, cname] = await Promise.all([
    getJSON(urls["site"]),
    getJSON(urls["tunasync"]),
    getJSON(urls["info"]),
    getJSON(urls["options"]),
    getJSON(urls["cname"]),
  ]);

  const mirrorz = {};
  mirrorz["site"] = site;
  mirrorz["info"] = info.map((inf) => {
    return {
      distro: name(inf["distro"], cname),
      category: inf["category"],
      urls: inf["urls"],
    };
  });
  mirrorz["mirrors"] = tunasync
    .filter((sync) => {
      return sync["name"] != "";
    })
    .map((sync) => {
      return {
        cname: name(sync["name"], cname),
        desc: desc(sync["name"], options),
        url: "/" + sync["name"],
        status: stat(sync),
        help: help(sync["name"], options),
        upstream: upstream(sync, tunasync),
      };
    })
    .concat(
      options["options"]["unlisted_mirrors"]
        .filter((sync) => {
          return sync["name"] != "";
        })
        .map((sync) => {
          return {
            cname: name(sync["name"], cname),
            desc: desc(sync["name"], options),
            url: sync["url"],
            status: stat(sync),
            help: help(sync["name"], options),
            upstream: upstream(sync, tunasync),
          };
        })
    );

  return new Response(JSON.stringify(mirrorz, null, 2), {
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

addEventListener("fetch", (event) => {
  return event.respondWith(handleRequest(event.request));
});

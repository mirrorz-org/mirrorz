const pug = require("pug");
const fs = require("fs");
const fetch = require("node-fetch");

// 这里 isolist 与 isolist_name 形成对应关系 假设 isolist[0] 是 Arch Linux 发行版内容 isolist_name[0] 就是 Arch Linux
let isolist = [];
let isolist_name = [];
let isolist_category = [];

let mlist = [];
let mlist_name = [];
let sites = [];
// 写 头 这里直接借了 react 版编译好的 css / svg
let head = fs.readFileSync(__dirname + "/template/head.pug.tempest");
fs.readdirSync(__dirname + "/../dist/").map((f) => {
  if (f.includes(".css")) {
    head += `  link(rel='stylesheet', href='/${f}')\n`;
  } else if (f.includes(".svg")) {
    head += `  link(rel='icon', type='image/svg+xml', href='/${f}')\n`;
  }
});
fs.writeFileSync(__dirname + "/template/head.pug", head);
handle();
async function handle() {
  // 这里可能会下载失败，可能要再改改
  await asyncForEach(require("../src/config/mirrors"), async (url) => {
    let remote_flag = true;
    try {
      if (url.includes("https://mirrorz.org/static")) {
        // /static 为本地的，直接读文件
        let url_local = url.replace("https://mirrorz.org", "/..");
        console.log("hit local file", `${url_local}`);
        sites.push(require(`${__dirname}${url_local}`));
        remote_flag = false;
      }
    } catch (error) {
      // 这里没有用 .error 怕整个 CI 炸
      console.warn("hit error", url);
    }
    if (remote_flag) {
      let data = await download_file(url)
      if (data == "e") {
        console.warn("download error", url);
      } else {
        sites.push(data);
      }
    }
  });
  sites.forEach((s, sid) => {
    // 补全 / （后面发现不用补）
    let base_url = s.site.url; // + (s.site.url.substr(-1,1) !== '/' ? '/' : '')
    // 安排 /iso
    s.info.forEach((info) => {
      let i = isolist_name.indexOf(info.distro);
      if (!isolist_name.includes(info.distro)) {
        i = isolist_name.length;
        isolist_name.push(info.distro);
        isolist_category.push(info.category);
      }
      if (isolist[i] === undefined) {
        isolist[i] = [];
      }
      if (isolist[i][sid] === undefined) {
        isolist[i].push({
          abbr: s.site.abbr,
          data: info.urls.map((u) => {
            return {
              url: base_url + u.url,
              name: u.name,
            };
          }),
        });
      }
    });
    //安排 /list
    s.mirrors.forEach((m) => {
      let i = mlist_name.indexOf(m.cname);
      if (!mlist_name.includes(m.cname)) {
        i = mlist_name.length;
        mlist_name.push(m.cname);
        mlist[i] = [];
      }
      m.url = base_url + m.url;
      if (m.help) {
        m.help =
          m.help !== ""
            ? m.help.includes("http")
              ? m.help
              : base_url + m.help
            : false;
      }
      m.site = {
        abbr: s.site.abbr,
        name: s.site.name,
        note: s.site.note,
      };
      if (m.desc == "") {
        m.desc = "无可奉告";
      }
      mlist[i].push(m);
    });
  });
  isolist.forEach((data, id) => {
    data = data.sort((a, b) => a.abbr.localeCompare(b.abbr));
    let category = isolist_category[id];
    let name = isolist_name[id];
    let html = pug.compileFile("./legacy/template/iso_content.pug")({
      sidebar: isolist_name
        .map((n) => {
          let tid = isolist_name.indexOf(n);
          if (category != isolist_category[tid]) {
            return false;
          }
          return {
            url: `/_/${isolist_category[tid]}/${n.replace(/ /gi, "")}`,
            name: n.trim(),
            active: n == name,
          };
        })
        .filter((x) => {
          return x;
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
      navbar_active: isolist_category[id],
      distro_name: name,
      data: data,
    });
    wf(
      `../dist/_/${isolist_category[id]}/${name.replace(/ /gi, "")}/index.html`,
      html
    );
  });
  // 生成 /list
  wf(
    `../dist/_/list/index.html`,
    pug.compileFile("./legacy/template/list_index.pug")({
      data: mlist_name
        .map((m) => {
          return {
            name: m.trim(),
            url: `/_/list/${m.replace(/ /gi, "")}`,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    })
  );
  // 上面的 ; 是一定要的 不然会报错（（（
  // 生成 /os /app /font /
  ["font", "app", "os"].forEach((category) => {
    let html = pug.compileFile("./legacy/template/iso_index.pug")({
      sidebar: isolist_name
        .map((n) => {
          let tid = isolist_name.indexOf(n);
          if (category != isolist_category[tid]) {
            return false;
          }
          return {
            url: `/_/${isolist_category[tid]}/${n.replace(/ /gi, "")}`,
            name: n.trim(),
          };
        })
        .filter((x) => {
          return x;
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
      navbar_active: category,
    });
    wf(`../dist/_/${category}/index.html`, html);
    wf(`../dist/_/index.html`, html);
  });
  // /list/:name
  mlist.forEach((data, id) => {
    let name = mlist_name[id];
    let html = pug.compileFile("./legacy/template/list_content.pug")({
      name: name,
      data: data.sort((a, b) => a.site.abbr.localeCompare(b.site.abbr)),
    });
    wf(`../dist/_/list/${name.replace(/ /gi, "")}/index.html`, html);
  });
  sites
    .sort((a, b) => b.site.abbr.localeCompare(a.site.abbr))
    .forEach((data) => {
      let html = pug.compileFile("./legacy/template/site.pug")({
        data: data,
        sidebar: sites
          .map((n) => {
            return {
              url: `/_/site/${n.site.abbr}`,
              abbr: n.site.abbr,
              logo: n.site.logo,
              active: n.site.abbr == data.site.abbr,
            };
          })
          .sort((a, b) => a.abbr.localeCompare(b.abbr)),
      });
      // 目前 BFSU 在 MirrorZ 中是排最前的 所以就钦定你是 /site 首页了
      wf(`../dist/_/site/index.html`, html);
      wf(`../dist/_/site/${data.site.abbr}/index.html`, html);
    });
  wf(
    `../dist/_/about/index.html`,
    pug.compileFile("./legacy/template/about.pug")({
      sites: sites.sort((a, b) => a.site.abbr.localeCompare(b.site.abbr)),
    })
  );
}
// 随便写的垃圾函数 其实应该 import 个 path 处理 subpath
// wf -> write file
function wf(path, data) {
  console.log("w", path.replace("..", "/_"));
  let subpath = path.split("/");
  delete subpath[subpath.length - 1];
  subpath = __dirname + "/" + subpath.join("/");
  if (!fs.existsSync(subpath)) {
    fs.mkdirSync(subpath, {
      recursive: true,
    });
  }
  fs.writeFileSync(__dirname + "/" + path, data);
}
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
/**
 * download file (with retry)
 * @param {*} url url
 * @returns {JSON}
 */
async function download_file(url, try_time = 0) {
  try {
    console.log("downloading", try_time, url);
    let data = await fetch(url, { timeout: 15000 });
    return await data.json();
  } catch (error) {
    console.warn("download error", try_time, url);
    if (try_time > 5) {
      return "e";
    }
    return download_file(url.replace("sss", ""), try_time + 1);
  }
}

module.exports = function (o, n) {
  let union = (l, r, f) => Array.from(new Set(f(l).concat(f(r))));
  let find = (arr, n, key) => { for (p of arr) if(p[key] == n) return p; return null; }
  log = ""
  // site, ignore disk
  let sitekeys = union(o, n, (e) => Object.keys(e.site));
  for (k of sitekeys) {
    if (k === "disk")
      continue
    if (k in o.site && !(k in n.site))
      log += `- site.${k}:${o.site[k]}\n`
    if (!(k in o.site) && k in n.site)
      log += `+ site.${k}:${n.site[k]}\n`
    if (k in o.site && k in n.site && o.site[k] !== n.site[k]) {
      log += `- site.${k}:${o.site[k]}\n`
      log += `+ site.${k}:${n.site[k]}\n`
    }
  }
  // info
  let infodistros = union(o, n, (e) => e.info.map((e) => e.distro));
  for (d of infodistros) {
    let od = find(o.info, d, "distro")
    let nd = find(n.info, d, "distro")
    if (nd === null)
      log += `- info:${d}\n`
    if (od === null)
      log += `+ info:${d}\n`
    if (od !== null && nd !== null) {
      if (od.category != nd.category) {
        log += `- info:${d}\n`
        log += `+ info:${d}\n`
      }
      let urlsnames = union(od, nd, (e) => e.urls.map((e) => e.name));
      for (na of urlsnames) {
        let on = find(od.urls, na, "name")
        let nn = find(nd.urls, na, "name")
        if (nn === null)
          log += '- ' + 'info:' + d + ':urls:' + na + '\n'
          log += `- info:${d}:urls:${na}\n`
        if (on === null)
          log += `+ info:${d}:urls:${na}\n`
        if (on !== null && nn !== null && on.url !== nn.url) {
          log += `- info:${d}:urls:${na}:url:${on.url}\n`
          log += `+ info:${d}:urls:${na}:url:${nn.url}\n`
        }
      }
    }
  }
  // mirrors, without comparing status and size
  let mirrorscnames = union(o, n, (e) => e.mirrors.map((e) => e.cname));
  for (c of mirrorscnames) {
    let oc = find(o.mirrors, c, "cname")
    let nc = find(n.mirrors, c, "cname")
    if (oc === null)
      log += `- mirrors:${c}\n`
    if (nc === null)
      log += `+ mirrors:${c}\n`
    if (oc !== null && nc !== null) {
      for (k of ["url", "desc", "help", "upstream"]) {
        if (k in oc && !(k in nc))
          log += `- mirrors:${c}:${k}:${oc[k]}\n`
        if (k in nc && !(k in oc))
          log += `+ mirrors:${c}:${k}:${nc[k]}\n`
        if (k in oc && k in nc && oc[k] !== nc[k]) {
          log += `- mirrors:${c}:${k}:${oc[k]}\n`
          log += `+ mirrors:${c}:${k}:${nc[k]}\n`
        }
      }
    }
  }
  return log
}

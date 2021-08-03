# 302 Backend

At [https://mirrors.mirrorz.org](https://mirrors.mirrorz.org) or [https://m.mirrorz.org](https://m.mirrorz.org) a 302 backend is deployed.

You may visit [https://m.mirrorz.org/archlinux/](https://m.mirrorz.org/archlinux/). Note that only `/${cname}` from the [frontend](https://mirrorz.org/list)/[monitor](https://mirrorz.org/monitor) are valid pathnames.

Currently this is deployed using Cloudflare Workers. Credentials are configured as environment variables.

# 302 Decision

Currently redirecting is decided from information collected by the monitor. Several policies are discussed below. More policies are welcome!

## Newest

This is the current policy. But users may experience low bandwidth.

## Nearest

This is not available now as these meta data (location, ISP, etc) are not provided and collected.

## Random

Not practical, one user may be redirected to a mirror synced several weeks ago, resulting in many 404.

# mirrors.edu.cn

We may use the domain name `mirrors.edu.cn` for providing frontend AND 302 backend service if we have shown enough potential.

## policy

1. Requests to `/`, `/(os|app|font)`, `/list`, `/site`, `/about`, `/_` would be redirected to `/`, off-loading to front-end; other requests would go to 302 backend.
2. The backend checks `Host` in HTTP header, e.g. `tuna6-ustccmcc-ustcchinanet-sjtugsiyuan.mirrors.edu.cn`, which means the user prefers sjtu siyuan server the most, then ustc in chinanet, ustc in cmcc, then tuna in ipv6, then at mirrorz's own wish.
3. According to the repo the user request, one potential list of mirror sites is filtered. Filter by whether this mirror site has the repo (e.g. `/archlinux`), has the content (using search backend, e.g. `/archlinux/sth.iso`), is syncing or not and is public or not.
4. Select the nearest mirror site for the user, namely what the user preferred, and what the mirror site declared. If more than one mirror sites apply, we randomly select one (e.g. user has no preference, BFSU and USTC declares CMCC and their syncing status is the same). If neither applies, mirrorz uses geoip.

## mirrorz.d.json

Any mirror site participating in **302 backend** should provide this file. Mirror site uses this file to announce their capabilities and restrictions. It is worth noting this file has no conflict with `mirrorz.json` so a mirror site may integrate them together.

```json
{
  "extension": "D",
  "endpoints": [
    {
      "label": "ustc",
      "public": true,
      "resolve": "mirrors.ustc.edu.cn",
      "range": []
    },
    {
      "label": "ustc6",
      "public": true,
      "resolve": "ipv6.mirrors.ustc.edu.cn",
      "range": [ "V6" ]
    },
    {
      "label": "ustcchinanet",
      "public": true,
      "resolve": "chinanet.mirrors.ustc.edu.cn",
      "range": [
        "AS4134",
        "AS4809"
      ]
    },
    {
      "label": "ustccampus",
      "public": false,
      "resolve": "10.0.0.1:8080/proxy",
      "range": [
        "202.0.0.0/24",
        "2001:da8::/32"
      ]
    }
  ],
  "site": { "the same as mirrorz.json/site" },
  "mirrors": [ "the same as mirrorz.json/mirrors" ]
}
```

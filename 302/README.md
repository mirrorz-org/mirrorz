# 302 Backend

At [https://mirrors.mirrorz.org](https://mirrors.mirrorz.org) or [https://m.mirrorz.org](https://m.mirrorz.org) a 302 backend is deployed.

You may visit [https://m.mirrorz.org/archlinux/](https://m.mirrorz.org/archlinux/). Note that only `/${cname}` from the [frontend](https://mirrorz.org/list)/[monitor](https://mirrorz.org/monitor) are valid pathnames.

Currently this is deployed using Cloudflare Workers. Code with credentials stripped are in `302.js`.

# 302 Decision

Currently redirecting is decided from information collected by the monitor. Several policies are discussed below. More policies are welcome!

## Newest

This is the current policy. But users may experience low bandwidth.

## Nearest

This is not available now as these meta data (location, ISP, etc) are not provided and collected.

## Random

Not practical, one user may be redirected to a mirror synced several weeks ago, resulting in many 404.

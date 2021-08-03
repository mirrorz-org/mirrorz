# Search Backend

At <https://search.mirrorz.org> or <https://s.mirrorz.org> a search backend is deployed.

You may visit <https://s.mirrorz.org/archlinux/> or <http://s.mirrorz.org/openwrt/snapshots/targets/zynq/generic/sha256sums>. Note that only `/${cname}` from the [frontend](https://mirrorz.org/list)/[monitor](https://mirrorz.org/monitor) are valid pathnames.

Currently this is deployed using Cloudflare Workers. Credentials are configured as environment variables.

One search has a timeout of 10 seconds currently.

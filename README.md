# MirrorZ

Your next MirrorS is not MirrorS, nor MirrorSes, it's MirrorZ.

## Intro

MirrorS are heterogeneous. It is hard for a single mirror to provide all mirrors, so differences occur.

For end users, this is not a good experience as they need to search for available mirrors.

To make things easy, MirrorZ is intended to include all the mirrorS, so a unified interface is needed.

## Data Format v1 (draft)

Each MirrorS participating in MirrorZ should provide a `mirrorz.json` with the following fields.

```json
{
  "version": 1,
  "site": {
    "url": "https://example.org",
    "logo": "https://example.org/favicon.ico",
    "abbr": "EXAMPLE",
  },
  "info": [
    {
      "distro": "Debian",
      "category": "os",
            "urls": [
                {
                    "name": "10.7.0 (amd64, CD installer with xfce)",
                    "url": "/debian-cd/current/amd64/iso-cd/debian-10.7.0-amd64-xfce-CD-1.iso"
                }
            ]
    }
  ],
  "mirrors": [
    {
      "cname": "AOSP",
      "desc": "Android 操作系统源代码",
      "url": "/AOSP",
      "status": "S",
      "help": "/help/AOSP/",
      "upstream": "https://android.googlesource.com/mirror/manifest"
    },
    {
      "cname": "AUR",
      "desc": "Arch Linux 用户软件库",
      "url": "https://aur.tuna.tsinghua.edu.cn/",
      "status": "S",
      "help": "/help/AUR/",
      "upstream": "https://aur.archlinux.org/"
    }
  ]
}
```

### Notes

* `version` is optional for version 1
* `site` provides the global info about one MirrorS
* `site.url` should not end with slash `/`
* `info` is used for category view
* the name of `info.distro` should be agreed and have a mapping
* `mirrors` is used for list view
* the name of `mirrors.cname` should be agreed and have a mapping `cname.json`
* `mirrors.desc` may differ for each MirrorS since there are `excludes` for some MirrorS
* `mirrors.desc` may be empty
* if `mirrors.url` begins with a slash `/`, it should be appended to `site.url` to form a full url
* `mirrors.status` should be agreed, currently some values are defined in `tunasync`
* `mirrors.help` may be empty, or the same rule as `mirrors.url`
* `mirrors.upstream` may be empty

## Backend and FrontEnd

For each MirrorS, it should provide a `mirrorz.json` in its domain and allow CORS of `www.mirrorz.org` on that file.

The list of participating MirrorS should be maintained here.

For the front end, currently a naive one is implemented using JQuery, one MirrorS may provide their FrontEnd for rendering, for example `www.mirrorz.org/{tuna,ustc,sjtug,hit}/index.html`.

<!--
 vim: ts=2 sts=2 sw=2
-->

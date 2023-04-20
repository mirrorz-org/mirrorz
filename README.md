# MirrorZ

Your next MirrorS is not MirrorS, nor MirrorSes, it's MirrorZ.

A final site for Mirror sites.

## Demo

<https://mirrorz.org> and <https://mirrors.cernet.edu.cn>

Also legacy webpages (for w3m and noscript users) are provided in <https://mirrorz.org/_/> and <https://mirrors.cernet.edu.cn/_/>

A speed test script [oh-my-mirrorz.py](https://mirrorz.org/oh-my-mirrorz.py) is also provided. See [README](https://github.com/mirrorz-org/oh-my-mirrorz) for more info.

## Intro

Mirror sites are heterogeneous. It is hard for a single mirror to provide all mirrors, so differences occur.

For end users, this is not a good experience as they need to search for available mirrors.

To make things easy, MirrorZ is intended to include all mirrorS, so a unified interface is needed.

## Data Format v1.7

A `mirrorz.json` in the following format describes all the data of one mirror site in MirrorZ.

```json
{
  "version": 1.7,
  "site": {
    "url": "https://example.org",
    "logo": "https://example.org/img/logo.svg",
    "logo_darkmode": "https://example.org/img/logo-white.svg",
    "abbr": "EXAMPLE",
    "name": "样例镜像站",
    "homepage": "https://blog.example.org",
    "issue": "https://github.com/example/issues",
    "request": "https://github.com/example/mirror-request",
    "email": "admin@example.com",
    "group": "QQ: 10086 and/or Telegram @something",
    "disk": "may be any string showing usage of disk, e.g. usage",
    "note": "may be any string; like speed limit or connection limit",
    "big": "/speedtest/1000mb.bin",
    "maintenance": false
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
      "upstream": "https://android.googlesource.com/mirror/manifest",
      "size": "596G"
    },
    {
      "cname": "AUR",
      "desc": "Arch Linux 用户软件库",
      "url": "https://aur.tuna.tsinghua.edu.cn",
      "status": "S1612195849X1612196849N",
      "help": "/help/AUR/",
      "upstream": "https://aur.archlinux.org/"
    }
  ]
}
```

### Notes

* `version` is optional for version 1.x
  - previous versions of this protocol could be found in git history; protocols in v1.x are back-ward compatible
* `site` provides the global info about one mirror site
  - only `site.url` and `site.abbr` are mandatory
  - `site.logo` should not be of format `ico`. Also, at least 64x64 resolution is required
  - `site.logo_darkmode` is used when browser uses dark mode. Note that it should be set only after `site.logo` is set
  - `site.url` should not end with slash `/`
  - `site.big` should be a valid url to a big file, used by `oh-my-mirrorz.py` for speed testing
  - `site.maintenance` is a boolean value, indicating whether the site is under maintenance. If true, mirrorz-302 will not redirect to the site
* `info` is used for category view
  - all field of `info` is mandatory
  - `info` may be left empty as `[]`
  - the name of `info.distro` should be agreed and have a mapping, maintained in `cname.json`
* `mirrors` is used for list view
  - the name of `mirrors.cname` should be agreed and have a mapping, maintained in `cname.json`
  - `mirrors.desc` may differ for each mirror site since there are `excludes` for some mirror site
  - `mirrors.desc` may be empty
  - if `mirrors.url` begins with a slash `/`, it should be appended to `site.url` to form a full url
  - `mirrors.url` should not end with slash `/`
  - `mirrors.status` is a concat of strings of pattern `[A-Z](\d+)?`. Only one main status is allowed; the number of auxiliary status is not limited.
    + `S1600000000`: successful. (optional) last successful ended unix timestamp
    + `D1600000000`: pending. (optional) pending to sync unix timestamp
    + `Y1600000000`: syncing. (optional) start to sync unix timestamp
    + `F1600000000`: failed. (optional) last attempt to sync unix timestamp
    + `P1600000000`: paused. (optional) the unix timestamp sync stopped
    + `C`: reverse proxy with cache
    + `R`: reverse proxy without cache
    + `U`: unknown
    + `X1600000000`: (auxiliary) next scheduled sync unix timestamp
    + `N1600000000`: (auxiliary) new mirror. (optional) unix timestamp the repo added
    + `O1600000000`: (auxiliary) old successful timestamp, used only when it is syncing or failed
  - `mirrors.help` may be empty, or the same rule as `mirrors.url`
  - `mirrors.upstream`, `mirrors.size` may be empty

## Developing and Contributing

### Repo organization

This repo depends on other repos in this organization to provide full functionality; However, they are not submodules as we need to bump submodules whenever there is an update, which is painful. We just use the latest version of each repo when building.

For full preparation of all the repos, you should refer to the `Prepare` steps in [Github Actions](https://github.com/mirrorz-org/mirrorz/blob/master/.github/workflows/deploy.yml).

Note that `yarn mirrorz_env` prepares for <https://mirrorz.org>. When you are debugging, it is recommended to use `yarn dev_env` and `yarn debug_build`, which builds the site for <http://localhost:1234>. Other `env` like `cngi_env` and `cernet_env` prepares for other sites that mirrorz maintain.

### Frontend

#### HTML/CSS

One may use

```
yarn --frozen-lockfile
yarn start
```

to start a local server. It is often convenient for debugging frontend features like html/css since auto-reload is provided by parcel.

#### Parser, local new static files

To debug one `src/parser` with new site json in `static/json/site`, use

```
yarn --frozen-lockfile
yarn half_start
```

to start a local server. Python3 is required in this case. Note there is no auto-reload feature.

#### Legacy pages

To use static files, 404 redirection (emulate Github pages) and legacy pages, one may use

```
yarn --frozen-lockfile
yarn full_start
```

to start a local server. Python3 is required in this case. Note there is no auto-reload feature.

### Deployment

For dynamic web page part, only

```
yarn build
```

is required.

However if one also wants to deploy the static web page, one may use

```
yarn build
yarn legacy_build
```

Note that `legacy_build` has dependencies on files `yarn build` has made.

Meanwhile, to generate the complete `oh-my-mirrorz.py`, one should use the following command

```
yarn ohmymirrorz_build
```

If one want all parts, one can use the following command to accomplish all the steps above

```
yarn full_build
```

### Misc

Currently `*.json` is ignored in `.gitignore` (not ignored in `/static`). If one wants to commit a json file, they should use `git add -f`.

### Contributing

Other contributing guidelines are maintained in <https://github.com/mirrorz-org/org/wiki>

<!--
 vim: ts=2 sts=2 sw=2
-->

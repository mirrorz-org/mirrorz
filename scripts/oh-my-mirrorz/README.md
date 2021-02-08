# oh-my-mirrorz

A script for speed testing for each mirrors providing mirrorz service.

## How to use

Make sure you have `curl` installed. Also at least Python 3.5 is required, and `requests` package is installed.

Use

```
curl https://mirrorz.org/oh-my-mirrorz.py | python3
```

or

```
curl -O https://mirrorz.org/oh-my-mirrorz.py
chmod +x ./oh-my-mirrorz.py
./oh-my-mirrorz.py
```

If you get stuck when loading meta data, you may issue `Ctrl+C` to skip one mirrors.

## Proxy

This script sends two kinds of http request: python `requests` to get metadata and `curl` to do actual speed test.

Some sites provide their meta data (`mirrorz.json`) in a place that is hard to access, which you may use a proxy. In this case you may set `HTTP_PROXY` or `HTTPS_PROXY`, which is used by python `requests`.

In some settings you may use a proxy to do actual downloading, in this case you may set `http_proxy` or `https_proxy`. Note that these lowercase envs are also read by python `requests`.

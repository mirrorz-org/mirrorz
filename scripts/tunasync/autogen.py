#!/usr/bin/env python3
import json
import urllib.request
import mirrorz
import config

def fetch_json(url):
    print(f"fetching {url}")
    response = urllib.request.urlopen(url)
    data = response.read()
    return json.loads(data)

def main():
    for name, cfg in config.sites.items():
        values=[]
        for fn in ("site", "tunasync", "info", "options", "cname", "disk"):
            if fn not in cfg or cfg[fn] == "":
                values.append({})
            else:
                values.append(fetch_json(cfg[fn]))
        result = mirrorz.generate(*values)
        with open(name+".json", "w") as f:
            f.write(json.dumps(result))

if __name__ == '__main__':
    main()
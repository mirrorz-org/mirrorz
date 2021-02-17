import json
import sys
import requests
import subprocess
import re
import sys


options = {}
cname = {}


def name_func(name: str) -> str:
    if name in cname:
        return cname[name]
    else:
        return name

def main():
    global cname
    if len(sys.argv) < 3:
        print("help: mirrorz.py site.json cname.json")
        sys.exit(0)
    site = json.loads(open(sys.argv[1]).read())
    task = requests.get("https://mirrors.njupt.edu.cn/mirrordsync.json").json()
    info = requests.get("https://mirrors.njupt.edu.cn/isoinfo.json").json()
    cname = json.loads(open(sys.argv[2]).read())

    mirrors = []

    for k, v in task.items():
        mirror = {
            "cname": name_func(k),
            "url": "/" + k,
        }
        if "upstream" in v:
            mirror["upstream"] = v["upstream"]
        mirrors.append(mirror)

    mirrorz = {}
    mirrorz["site"] = site
    mirrorz["info"] = info
    mirrorz["mirrors"] = mirrors

    print(json.dumps(mirrorz))

if __name__ == '__main__':
    main()

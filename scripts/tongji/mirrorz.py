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
    l = requests.get("https://mirrors.tongji.edu.cn/public/meta/list.json").json()
    cname = json.loads(open(sys.argv[2]).read())

    mirrors = []

    for i in l:
        mirror = {
            "cname": name_func(i["name"]),
        }
        if i["url"] == "":
            mirror["url"] = site["url"]
        else:
            mirror["url"] = i["url"]
        if i["help"] != "":
            mirror["help"] = i["help"]
        mirrors.append(mirror)

    mirrorz = {}
    mirrorz["site"] = site
    mirrorz["info"] = [] 
    mirrorz["mirrors"] = mirrors

    print(json.dumps(mirrorz))

if __name__ == '__main__':
    main()

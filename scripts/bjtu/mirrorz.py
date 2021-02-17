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
        print("help: mirrorz.py site.json cname_url")
        sys.exit(0)
    site = json.loads(open(sys.argv[1]).read())
    task = requests.get("https://mirror.bjtu.edu.cn/status/task_status.json").json()
    desc = requests.get("https://mirror.bjtu.edu.cn/help/desc_help.json").json()
    cname = requests.get(sys.argv[2]).json()

    mirrors = []

    for k, v in desc.items():
        mirror = {
            "cname": name_func(k)
        }
        if "link" in v:
            mirror["url"] = v["link"]
        else:
            mirror["url"] = "/" + k
        if "desc" in v:
            mirror["desc"] = v["desc"]
        if "help" in v:
            mirror["help"] = v["help"]
        for k1, v1 in task.items():
            if k1 == k and "upstream" in v1:
                mirror["upstream"] = v1["upstream"]
        mirrors.append(mirror)

    mirrorz = {}
    mirrorz["site"] = site
    mirrorz["info"] = [] 
    mirrorz["mirrors"] = mirrors

    print(json.dumps(mirrorz))

if __name__ == '__main__':
    main()

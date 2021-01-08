import json
import sys

options = {}
cname = {}

def name(name):
    if name in cname:
        return cname[name]
    else:
        return name

def status(sync):
    s = ""
    d = {
        "success": "S",
        "syncing": "Y",
        "unknown": "U",
        "failed": "F",
        "fail": "F",
        "paused": "U"
    }
    if "status" in sync and sync["status"] in d:
        s += d[sync["status"]]
    else:
        s += "U"

    if sync["name"] in options["options"]["new_mirrors"]:
        s += "N"
    
    return s

def help(sync):
    l = ""
    for d in options["helps"]:
        if sync["name"] == d["mirrorid"]:
            l = d["url"]
    return l

def main():
    global options
    global cname
    if len(sys.argv) < 6:
        print("help: mirrorz.py site.json tunasync.json isoinfo.json options.json cname.json")
        sys.exit(0)
    site = json.loads(open(sys.argv[1]).read())
    tunasync = json.loads(open(sys.argv[2]).read())
    info = json.loads(open(sys.argv[3]).read())
    options = json.loads(open(sys.argv[4]).read())
    cname = json.loads(open(sys.argv[5]).read())
    mirrorz = {}
    mirrorz["site"] = site
    mirrorz["info"] = info
    mirrors = []
    for i in range(len(tunasync)):
        sync = tunasync[i]
        mirror = {
            "cname": name(sync["name"]),
            "url": "/" + sync["name"],
            "status": status(sync),
            "help": help(sync),
            "upstream": sync["upstream"]
        }
        mirrors.append(mirror)

    for unlisted in options["options"]["unlisted_mirrors"]:
        mirror = {
            "cname": name(unlisted["name"]),
            "url": unlisted["url"],
            "status": status(unlisted),
            "help": help(unlisted),
            "upstream": ""
        }
        mirrors.append(mirror)
    mirrorz["mirrors"] = mirrors
    print(json.dumps(mirrorz))

if __name__ == '__main__':
    main()

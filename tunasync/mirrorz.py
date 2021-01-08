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
        "paused": "P"
    }
    if "status" in sync and sync["status"] in d:
        s += d[sync["status"]]
    else:
        s += "U"

    if sync["name"] in options["options"]["new_mirrors"]:
        s += "N"
    
    return s

def help(name):
    l = ""
    for d in options["helps"]:
        if name == d["mirrorid"]:
            l = d["url"]
    return l

def desc(name):
    s = ""
    for d in options["options"]["mirror_desc"]:
        if name == d["name"]:
            s = d["desc"]
    return s

def upstream(sync, tunasync):
    if "upstream" in sync:
        return sync["upstream"]
    elif "link_to" in sync:
        for other in tunasync:
            if other["name"] == sync["link_to"]:
                if "upstream" in other:
                    return other["upstream"]
                else:
                    return ""
    return ""


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
        if sync["name"] == "":
            continue
        mirror = {
            "cname": name(sync["name"]),
            "desc": desc(sync["name"]),
            "url": "/" + sync["name"],
            "status": status(sync),
            "help": help(sync["name"]),
            "upstream": upstream(sync, tunasync)
        }
        mirrors.append(mirror)

    for unlisted in options["options"]["unlisted_mirrors"]:
        if unlisted["name"] == "":
            continue
        mirror = {
            "cname": name(unlisted["name"]),
            "desc": desc(unlisted["name"]),
            "url": unlisted["url"],
            "status": status(unlisted),
            "help": help(unlisted["name"]),
            "upstream": upstream(unlisted, tunasync)
        }
        mirrors.append(mirror)
    mirrorz["mirrors"] = mirrors
    print(json.dumps(mirrorz))

if __name__ == '__main__':
    main()

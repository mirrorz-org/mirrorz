import json
import sys

options = {}
cname = {}

def name(name):
    if name in cname:
        return cname[name]
    else:
        return name

def status(sync, tunasync):
    if "link_to" in sync:
        for other in tunasync:
            if other["name"] == sync["link_to"]:
                # recursive find status / recalculate
                return status(other, tunasync)

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
        s = d[sync["status"]]
    else:
        s = "U"

    if (s == "S" or s == "P") and "last_update_ts" in sync and sync["last_update_ts"] > 0:
        s += str(sync["last_update_ts"]) # successful sync end
    elif s == "Y" and "last_started_ts" in sync and sync["last_started_ts"] > 0:
        s += str(sync["last_started_ts"]) # sync start time stamp
        if "last_update_ts" in sync and sync["last_update_ts"] > 0:
            s += "O" + str(sync["last_update_ts"]) # last successful sync is still important
    elif s == "F" and "last_ended_ts" in sync and sync["last_ended_ts"] > 0:
        s += str(sync["last_ended_ts"]) # last attemped
        if "last_update_ts" in sync and sync["last_update_ts"] > 0:
            s += "O" + str(sync["last_update_ts"]) # last successful sync is still important

    if sync["name"] in options["options"]["new_mirrors"]:
        s += "N"

    if "next_schedule_ts" in sync and sync["next_schedule_ts"] > 0:
        s += "X" + str(sync["next_schedule_ts"])
    
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
    # rely on a feature that unlisted is processed later than normal items
    elif "link_to" in sync:
        for other in tunasync:
            if other["name"] == sync["link_to"]:
                if "upstream" in other:
                    return other["upstream"]
                else:
                    return ""
    return ""

def url(sync):
    if "url" in sync:
        return sync["url"]
    for n in options["options"]["force_redirect_help_mirrors"]:
        if n == sync["name"]:
            return help(sync["name"])
    return "/" + sync["name"]

# from https://stackoverflow.com/questions/1094841/reusable-library-to-get-human-readable-version-of-file-size
def size(num, suffix='B'):
    for unit in ['Ki','Mi','Gi','Ti','Pi','Ei','Zi']:
        if abs(num) < 1024.0:
            return "%3.2f%s%s" % (num, unit, suffix)
        num /= 1024.0
    return "%.1f%s%s" % (num, 'Yi', suffix)

def main():
    global options
    global cname
    if len(sys.argv) < 6:
        print("help: mirrorz.py site.json tunasync.json isoinfo.json options.json cname.json [disk.json]")
        sys.exit(0)
    site = json.loads(open(sys.argv[1]).read())
    # FIXME: multiple sync with the same name may occur, needs uniq()
    tunasync = json.loads(open(sys.argv[2]).read())
    info = json.loads(open(sys.argv[3]).read())
    options = json.loads(open(sys.argv[4]).read())
    cname = json.loads(open(sys.argv[5]).read())
    mirrorz = {}

    mirrorz["site"] = site
    if len(sys.argv) > 6:
        disk = json.loads(open(sys.argv[6]).read())
        mirrorz["site"]["disk"] = size(disk["used_kb"]) + " / " + size(disk["total_kb"])

    mirrorz["info"] = []
    for inf in info:
        mirrorz["info"].append({
            "distro": name(inf["distro"]),
            "category": inf["category"],
            "urls": inf["urls"]
        })

    mirrors = []
    # unlisted should be processed later than normal items
    for sync in tunasync + options["options"]["unlisted_mirrors"]:
        if sync["name"] == "":
            continue

        if "link_to" in sync:
            for other in tunasync:
                if other["name"] == sync["link_to"]:
                    break
            else:
                continue

        mirror = {
            "cname": name(sync["name"]),
            "desc": desc(sync["name"]),
            "url": url(sync),
            "status": status(sync, tunasync),
            "help": help(sync["name"]),
            "upstream": upstream(sync, tunasync)
        }
        mirrors.append(mirror)
    mirrorz["mirrors"] = mirrors
    print(json.dumps(mirrorz))

if __name__ == '__main__':
    main()

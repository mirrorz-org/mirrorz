#!/usr/bin/env python3

import json
import sys
import xml
from xml.dom import minidom
from dateutil.parser import parse

cname = {}


def name(name):
    if name in cname:
        return cname[name]
    else:
        return name


def status(param):
    if not param["Idle"]:
        return "Y"
    else:
        if param["Result"]:
            return "S"
        else:
            return "F"


def help(name, items):
    for item in items:
        if item.getElementsByTagName("title")[0].childNodes[0].data == name:
            return item.getElementsByTagName("link")[0].childNodes[0].data
    return ""


def main():
    global options
    global cname
    if len(sys.argv) < 5:
        print("help: mirrorz.py site.json summary.json help.xml cname.json")
        sys.exit(0)
    site = json.loads(open(sys.argv[1]).read())
    summary = json.loads(open(sys.argv[2]).read())
    help_items = minidom.parse(
        sys.argv[3]).documentElement.getElementsByTagName("item")
    cname = json.loads(open(sys.argv[4]).read())
    mirrorz = {}
    mirrorz["site"] = site
    mirrorz["info"] = []
    mirrors = []
    for worker, param in summary["WorkerStatus"].items():
        if worker.startswith("."):
            continue
        mirror = {
            "cname": name(worker),
            "desc": "",
            "url": "/" + worker,
            "status": f"{status(param)}{int(parse(param['LastFinished']).timestamp())}",
            "help": help(worker, help_items),
            "upstream": ""
        }
        mirrors.append(mirror)

    mirrorz["mirrors"] = mirrors
    print(json.dumps(mirrorz))


if __name__ == '__main__':
    main()

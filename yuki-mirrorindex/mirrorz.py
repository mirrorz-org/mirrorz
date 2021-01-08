import json
import sys
# import requests
# import subprocess
import re
import sys


content_regex = re.compile(r"\('(.+)', '(.*)', '(.*)', '(.+)'\)")


def iso(iso_orig: list) -> None:
    # modify iso_orig inplace
    for i in iso_orig:
        if not i.get("category"):
            i["category"] = "os"  # now ustcmirror has no category and all iso are OS.


def parse_content_meta(content_txt: str, meta: dict) -> dict:
    content_raw_list = content_txt.split("\n")
    content_list = []
    content_hash = {}
    for i in content_raw_list:
        item = content_regex.match(i)
        if not item:
            print(f"failed to parse content line {i}", file=sys.stderr)
            continue
        _, help_url, _, name = item.groups()
        content_hash[name.lower()] = len(content_list)
        content_list.append({
            "cname": name,
            "desc": "",  # now we don't have desc yet...
            "url": f"https://mirrors.ustc.edu.cn/{name}",
            "status": "U",
            "help": help_url,
            "upstream": None
        })
    # now we add data to content_list with meta!
    for i in meta:
        try:
            ind = content_hash[i["name"]]
            if i["syncing"]:
                content_list[ind]["status"] = "Y"
            elif i["exitCode"] == 0:
                content_list[ind]["status"] = "S"
            else:
                content_list[ind]["status"] = "F"
            content_list[ind]["upstream"] = i["upstream"]
        except KeyError:
            print(f"failed to parse {i['name']}", file=sys.stderr)
    return content_list


def main():
    if len(sys.argv) < 5:
        print("help: mirrorz.py site.json meta_url genisolist_prog gencontent_prog")
        sys.exit(0)
    # site = json.loads(open(sys.argv[1]).read())
    # meta = requests.get(sys.argv[2]).json()
    # isolist = subprocess.check_output(sys.argv[3])
    # content = subprocess.check_output(sys.argv[4])
    site = json.loads(open(sys.argv[1]).read())
    meta = json.loads(open(sys.argv[2]).read())
    isolist = json.loads(open(sys.argv[3]).read())
    content_txt = open(sys.argv[4]).read()

    iso(isolist)
    mirrors = parse_content_meta(content_txt, meta)

    mirrorz = {}
    mirrorz["site"] = site
    mirrorz["info"] = iso(isolist)
    mirrorz["mirrors"] = mirrors
    print(json.dumps(mirrorz))

if __name__ == '__main__':
    main()

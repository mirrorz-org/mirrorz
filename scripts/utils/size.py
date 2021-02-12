#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# vim: expandtab ts=4 sts=4 sw=4

import requests
import sys
import re

def size(str):
    m = re.search('([\d\.]+)\s?(\w)', str)
    if m == None:
        return 0
    n = float(m.group(1))
    s = m.group(2)
    if s == 'K':
        n *= 1024
    elif s == 'M':
        n *= 1024**2
    elif s == 'G':
        n *= 1024**3
    elif s == 'T':
        n *= 1024**4
    return n


def site_info(url):
    return requests.get(url, timeout=10).json()
  
def main():
    if len(sys.argv) < 2:
        print("help: mirrorz.py <url of mirrroz.json>")
        sys.exit(0)
   
    try:
        mirrorz = site_info(sys.argv[1])
        print('Loaded', mirrorz['site']['abbr'], ':', mirrorz['site']['url'])
    except:
        print('! Failed to load', sys.argv[1])
        pass

    print()

    mirrorz['mirrors'].sort(key=lambda x: size(x['size']) if 'size' in x else 0, reverse=True)

    for m in mirrorz['mirrors']:
        print(m['cname'], m['size'] if 'size' in m else '')

if __name__ == '__main__':
    main()

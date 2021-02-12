#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# vim: expandtab ts=4 sts=4 sw=4

import requests
import sys
import re
import time

def human(int):
    t = float(time.time() - int)
    quant = ['second', 'minute', 'hour', 'day', 'month', 'year']
    scale = [60, 60, 24, 30, 12]
    i = 0;
    while t > scale[i]:
        t /= scale[i]
        i += 1
    return f'{round(t)} {quant[i]} ago'


def last(str):
    S = re.search('S([\d]+)', str)
    O = re.search('O([\d]+)', str)
    if S == None and O == None:
        return 0xffffffff
    if S != None:
        return int(S.group(1))
    else:
        return int(O.group(1))


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

    mirrorz['mirrors'].sort(key=lambda x: last(x['status']) if 'status' in x else 0xffffffff)

    for m in mirrorz['mirrors']:
        print(m['cname'], human(last(m['status'])) if 'status' in m else '')

if __name__ == '__main__':
    main()

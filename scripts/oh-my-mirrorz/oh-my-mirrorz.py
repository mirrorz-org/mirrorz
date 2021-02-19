#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# vim: expandtab ts=4 sts=4 sw=4

import subprocess
import requests
import sys
import os

big = {
    'centos': '/8/isos/x86_64/CentOS-8.3.2011-x86_64-dvd1.iso',
    'archlinux': '/iso/latest/archlinux-2021.02.01-x86_64.iso',
    'ubuntu': '/indices/md5sums.gz',
    'debian': '/ls-lR.gz',
}

mirrors = [
    "https://mirrorz.org/static/json/legacy/tuna.json",
    "https://mirrorz.org/static/json/legacy/opentuna.json",
    "https://mirrorz.org/static/json/legacy/bfsu.json",
    "https://mirrors.ustc.edu.cn/static/json/mirrorz.json",
    "https://mirror.sjtu.edu.cn/mirrorz/siyuan.json",
    "https://mirror.sjtu.edu.cn/mirrorz/zhiyuan.json",
    "https://mirrors.dgut.edu.cn/static/mirrorz.json",
    "https://mirrors.sustech.edu.cn/mirrorz/mirrorz.json",
    "https://mirrorz.org/static/tmp/bjtu.json",
    "https://mirrorz.org/static/tmp/njupt.json",
    "https://mirrorz.org/static/tmp/xjtu.json",
    "https://mirrorz.org/static/tmp/tongji.json",
    "https://mirrorz.org/static/json/legacy/cqu.json",
    "https://mirrorz.org/static/json/legacy/uestc.json",
    "https://mirrorz.org/static/json/legacy/hit.json",
    "https://mirrorz.org/static/json/legacy/nju.json",
    "https://mirrorz.org/static/json/legacy/hust.json",
    "https://mirrorz.org/static/json/legacy/neusoft.json",
    "https://mirrorz.org/static/json/legacy/lzu.json",
]

map = {}

def check_curl():
    try:
        res = subprocess.run(['curl', '--version'], stdout=subprocess.PIPE)
        print(res.stdout.decode('utf-8'))
        return 0
    except:
        print("No curl found!")
        return -1

def site_info(url):
    return requests.get(url, timeout=10).json()

def speed_test(url):
    res = subprocess.run(['curl', '-qso', os.devnull, '-w', '%{http_code} %{speed_download}', '-m5', url], stdout=subprocess.PIPE)
    code, speed = res.stdout.decode('utf-8').split()
    return int(code), float(speed)

def human_readable_speed(speed):
    scale = ['B/s', 'KiB/s', 'MiB/s', 'GiB/s', 'TiB/s']
    i = 0
    while (speed > 1024.0):
        i += 1
        speed /= 1024.0
    return f'{speed:.2f} {scale[i]}'
   
def main():
    if check_curl() != 0:
        exit(-1)
    
    for url in mirrors:
        try:
            map[url] = site_info(url)
            print('Loaded', map[url]['site']['abbr'], ':', map[url]['site']['url'])
        except:
            print('! Failed to load', url)
            pass

    print()

    for _, v in map.items():
        uri = ''
        if 'big' in v['site']:
            uri = v['site']['big']
        else:
            for r, u in big.items():
                for m in v['mirrors']:
                    if m['cname'] == r:
                        uri = m['url'] + u
                        break
                else:
                    continue
                break
            else:
                print('! No big file found for', v['site']['abbr'], v['site']['url'])
                continue

        print('Speed testing', v['site']['abbr'], v['site']['url'] + uri, '... ', end='', flush=True)
        code, speed = speed_test(v['site']['url'] + uri)
        if code != 200:
            print('HTTP Code', code, 'Speed', human_readable_speed(speed))
        else:
            print(human_readable_speed(speed))

if __name__ == '__main__':
    main()

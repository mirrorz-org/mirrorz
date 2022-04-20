import { useEffect, useMemo, useState } from "react";
import upstreams from "../config/upstream";
import { Parser } from "../parser";
import { Mirror, Mirrorz, ParsedMirror, Site } from "../schema";
import { absoluteUrlOrConcatWithBase, emptyOrAbsolutUrlOrConcatWithBase } from "./utils";

async function MirrorzLoader(source: string | Parser) {
    try {
        return typeof source === "string" ? await (await fetch(source)).json() as Mirrorz : await source();
    } catch (err) {
        console.warn("MirrorzLoader", typeof source === "string" ? source : "", err);
    }
}

const parseMirror = (site: Site, { cname, url, help, size, desc, upstream, status }: Mirror): ParsedMirror => ({
    cname,
    full: absoluteUrlOrConcatWithBase(url, site.url),
    help: emptyOrAbsolutUrlOrConcatWithBase(help, site.url),
    upstream,
    desc,
    status: status === undefined ? "U" : status,
    size,
    source: site.abbr,
    note: site.note,
});

export function useMirrorzSites() {
    const [mirrorz, setMirrorz] = useState<{ [_: string]: Mirrorz }>({});
    function initAllMirrors() {
        upstreams.forEach(initMirror);
    }
    function initMirror(source: string | Parser) {
        MirrorzLoader(source).then(m => m && setMirrorz(original => ({ ...original, [m.site.abbr]: m })));
    }
    useEffect(() => {
        initAllMirrors();

        // try it again, dealing with network glitch
        const timeout = setTimeout(() => {
            console.log("Try load data again");
            initAllMirrors();
        }, 15 * 1000);

        const interval = setInterval(() => {
            console.log("Page", document.visibilityState);
            if (document.visibilityState === "visible") {
                console.log("Refresh data");
                initAllMirrors();
            }
        }, 300 * 1000);

        return () => clearInterval(interval);
    }, []);
    return mirrorz;
}

export const useSitesList = (sites: { [_: string]: Mirrorz }) => useMemo(() =>
    Object.values(sites).map(({ site, mirrors }) => ({
        site,
        parsed: mirrors.map(mirror => parseMirror(site, mirror))
    })).sort((a, b) => a.site.abbr.localeCompare(b.site.abbr)),
    [sites]);

export const useMirrorsList = (sites: { [_: string]: Mirrorz }) => useMemo(() =>
    Object.values(sites).flatMap(({ site, mirrors }) => mirrors.map(mirror => parseMirror(site, mirror))), [sites]);

export const useIsoInfoList = (sites: { [_: string]: Mirrorz }) => useMemo(() =>
    Object.values(sites).map(({ site, info }) => ({
        site,
        info: info ? info.map(({ category, distro, urls }) => ({
            category,
            distro,
            urls: urls.map(({ name, url }) => ({
                name,
                url: absoluteUrlOrConcatWithBase(url, site.url)
            })),
        })) : [],
    })).sort((a, b) => a.site.abbr.localeCompare(b.site.abbr)),
    [sites]);

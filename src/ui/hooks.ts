import { useEffect, useMemo, useState } from "react";
import upstreams from "../config/upstream";
import { Parser } from "../parser";
import { Mirror, Mirrorz, ParsedMirror, Site } from "../schema";
import { absoluteUrlOrConcatWithBase, emptyOrAbsolutUrlOrConcatWithBase } from "./utils";

async function MirrorzLoader(source: string | Parser) {
    return typeof source === "string" ? await (await fetch(source)).json() as Mirrorz : await source();
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
        MirrorzLoader(source).then(m => setMirrorz(original => ({ ...original, [m.site.abbr]: m })));
    }
    useEffect(() => {
        initAllMirrors();

        const interval = setInterval(() => {
            console.log("Page", document.visibilityState);
            if (document.visibilityState === "visible") {
                console.log("Refresh data");
                initAllMirrors();
            }
        }, 30 * 1000);

        return () => clearInterval(interval);
    }, []);
    return mirrorz;
}

export const useSites = (sites: { [_: string]: Mirrorz }) => useMemo(() =>
    Object.fromEntries(Object.entries(sites).map(([key, { site, mirrors }]) => [key,
        {
            site,
            parsed: mirrors.map(mirror => parseMirror(site, mirror))
        }])), [sites]);

export const useMirrors = (sites: { [_: string]: Mirrorz }) => useMemo(() =>
    Object.fromEntries(Object.entries(sites).map(([key, { site, mirrors }]) => [key,
        mirrors.map(mirror => parseMirror(site, mirror))])), [sites]);

export const useIsoInfo = (sites: { [_: string]: Mirrorz }) => useMemo(() =>
    Object.fromEntries(Object.entries(sites).map(([key, { site, info }]) => [key,
        {
            site,
            info: info.map(({ category, distro, urls }) => ({
                category,
                distro,
                urls: urls.map(({ name, url }) => ({
                    name,
                    url: absoluteUrlOrConcatWithBase(url, site.url)
                })),
            }))
        }])), [sites]);
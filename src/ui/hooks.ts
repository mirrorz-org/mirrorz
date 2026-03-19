import { useEffect, useMemo, useState } from "react";
import upstreams from "../config/upstream";
import config from "../config/config";
import { Parser } from "../parser";
import lint from "../parser/lint";
import { Mirror, Mirrorz, ParsedMirror, Site } from "../schema";
import { RepoScoring, Scoring } from "../schema/scoring";
import {
  absoluteUrlOrConcatWithBase,
  emptyOrAbsolutUrlOrConcatWithBase,
} from "./utils";

// Generic sorting function for sites with optional scoring
function sortSitesByScoring<T extends { site: Site }>(
  sitesList: T[],
  scoring?: Scoring
): T[] {
  const sitesListSortedByAbbr = sitesList.sort((a, b) =>
    a.site.abbr.localeCompare(b.site.abbr)
  );

  if (scoring === undefined) {
    return sitesListSortedByAbbr;
  }

  const sitesListSortedByScoring: (T & { score?: RepoScoring })[] = [];
  scoring.scores.forEach((r: RepoScoring) => {
    sitesListSortedByAbbr.forEach((s) => {
      if (s.site.abbr === r.abbr) {
        sitesListSortedByScoring.push({ ...s, score: r });
      }
    });
  });

  sitesListSortedByAbbr.forEach((s) => {
    const included = sitesListSortedByScoring.some(
      (r) => r.site.abbr === s.site.abbr
    );
    if (!included) {
      sitesListSortedByScoring.push(s);
    }
  });

  return sitesListSortedByScoring;
}

async function MirrorzLoader(source: string | Parser) {
  try {
    return typeof source === "string"
      ? (lint(await (await fetch(source)).json()) as Mirrorz)
      : await source();
  } catch (err) {
    console.warn(
      "MirrorzLoader",
      typeof source === "string" ? source : `(${typeof source}) ${source}`,
      err
    );
  }
}

async function ScoringLoader(cname: string) {
  try {
    if (config.about.includes("302-go"))
      return (await (await fetch("/api/scoring/" + cname)).json()) as Scoring;
  } catch (err) {
    console.warn("MirrorzScoringLoader", cname, err);
  }
}

const parseMirror = (
  site: Site,
  { cname, url, help, size, desc, upstream, status }: Mirror
): ParsedMirror => ({
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
    MirrorzLoader(source).then(
      (m) => m && setMirrorz((original) => ({ ...original, [m.site.abbr]: m }))
    );
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

export function useScoring() {
  const [scoring, setScoring] = useState<Scoring>();
  function initScoring() {
    ScoringLoader("").then((m) => m && setScoring(m));
  }
  useEffect(() => {
    initScoring();
  }, []);
  return scoring;
}

export const useSitesList = (
  sites: { [_: string]: Mirrorz },
  scoring?: Scoring
) =>
  useMemo(() => {
    const sitesListRaw = Object.values(sites).map(({ site, mirrors }) => ({
      site,
      parsed: mirrors.map((mirror) => parseMirror(site, mirror)),
    }));
    return sortSitesByScoring(sitesListRaw, scoring);
  }, [sites, scoring]);

export const useMirrorsList = (sites: { [_: string]: Mirrorz }) =>
  useMemo(
    () =>
      Object.values(sites).flatMap(({ site, mirrors }) =>
        mirrors.map((mirror) => parseMirror(site, mirror))
      ),
    [sites]
  );

export const useIsoInfoList = (
  sites: { [_: string]: Mirrorz },
  scoring?: Scoring
) =>
  useMemo(() => {
    const sitesListRaw = Object.values(sites).map(({ site, info }) => ({
      site,
      info: info
        ? info.map(({ category, distro, urls }) => ({
            category,
            distro,
            urls: (urls || []).map(({ name, url }) => ({
              name,
              url: absoluteUrlOrConcatWithBase(url, site.url),
            })),
          }))
        : [],
    }));
    return sortSitesByScoring(sitesListRaw, scoring);
  }, [sites, scoring]);

import React, { useEffect, useState, useMemo, useCallback } from "react";
import MIRROR_URLS from "./config/mirrors";
import Icon from './Icon';
import Mirrors from './Mirrors';

const PROTO_REGEX = /(^https?:)?\/\//;

export default React.memo(() => {
  const [mirrors, setMirrors] = useState([]);
  const [isoinfo, setIsoinfo] = useState([]);
  const [page, setPage] = useState(2);

  // Load all mirror configurations
  useEffect(() => {
    async function initMirror(url) {
      const resp = await fetch(url);
      const { site, info, mirrors } = await resp.json();

      const parsed = mirrors.map(({ cname, url, help, abbr, desc, upstream, status }) => {
        const fullUrl = url.match(PROTO_REGEX) ? url : site.url + url;
        const helpUrl =
          help === "" ? null : help.match(PROTO_REGEX) ? help : site.url + help;
        return {
          cname,
          full: fullUrl,
          help: helpUrl,
          upstream,
          desc,
          status,
          source: site.abbr,
        };
      });
      setMirrors(original => original.concat(parsed));

      setIsoinfo(original => original.concat(info));
    }

    // Fires and forget
    for (const mirror of MIRROR_URLS) initMirror(mirror);
  }, []);

  // sidebar funcs
  const toISO = useCallback(() => setPage(_ => 1), []);
  const toList = useCallback(() => setPage(_ => 2), []);

  return (
    <div>
      <div className="sidebar">
        <h2 className={page == 1? "active": ""} onClick={toISO}>ISO</h2>
        <h2 className={page == 2? "active": ""} onClick={toList}>List</h2>
      </div>
      <main>
        <Mirrors mirrors={mirrors} page={page}/>
      </main>
    </div>
  );
});

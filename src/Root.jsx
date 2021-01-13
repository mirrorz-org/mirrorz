import React, { useEffect, useState, useMemo, useCallback } from "react";
import MIRROR_URLS from "./config/mirrors";
import Icon from './Icon';

const PROTO_REGEX = /(^https?:)?\/\//;

export default React.memo(() => {
  const [mirrors, setMirrors] = useState([]);
  const [filter, setFilter] = useState('');

  // Load all mirror configurations
  useEffect(() => {
    async function initMirror(url) {
      const resp = await fetch(url);
      const { site, mirrors } = await resp.json();

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
    }

    // Fires and forget
    for (const mirror of MIRROR_URLS) initMirror(mirror);
  }, []);

  console.log(mirrors);

  // Clustering
  const grouped = useMemo(() => {
    const mapper = new Map();
    for(const m of mirrors) {
      if(!mapper.has(m.cname)) mapper.set(m.cname, []);
      mapper.get(m.cname).push(m);
    }
    return Array.from(mapper.entries())
      .map(([k, v]) => ({ group: k, entries: v }))
  }, [mirrors]);

  const updateFilter = useCallback((ev) => setFilter(ev.target.value), []);
  const filtered = grouped
    .filter((e) => filter === '' || e.group.indexOf(filter.toLowerCase()) !== -1)
    .sort((a, b) => {
      if(filter !== '') {
        const aFilterDominant = a.group.toLowerCase().indexOf(filter.toLowerCase()) === 0;
        const bFilterDominant = b.group.toLowerCase().indexOf(filter.toLowerCase()) === 0;
        if(aFilterDominant !== bFilterDominant) return aFilterDominant ? -1 : 1;
      }

      return a.group.toLowerCase().localeCompare(b.group.toLowerCase());
    });

  return (
    <main>
      <div class="search">
        <input value={filter} onChange={updateFilter} placeholder="Filter" />
        <Icon>search</Icon>
      </div>

      {filtered.map(({ group, entries }) => (
        <div key={group} class="group">
          <h2 class="heading" id={group}>
            <a href={`#${group}`}>
              <Icon>link</Icon>
            </a>
            {group}
          </h2>
          {entries.map(
            ({ full, help, upstream, desc, status, source }, idx) => (
              <div key={idx}>
                <a href={full}>
                  <h3>
                    {source}
                    {help && (
                      <a class="help" href={help}>
                        <Icon>help</Icon>
                      </a>
                    )}
                  </h3>
                </a>
                {upstream && (
                  <div class="upstream">
                    <Icon>outbound</Icon>
                    <a href={upstream}>{upstream}</a>
                  </div>
                )}
                {status && (
                  <div class="status">
                    <Icon>info</Icon>
                    {status}
                  </div>
                )}
                {desc ? (
                  <div class="desc">{desc}</div>
                ) : (
                  <div class="desc missing">无可奉告</div>
                )}
              </div>
            )
          )}
        </div>
      ))}
    </main>
  );
});

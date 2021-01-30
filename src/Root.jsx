import React, { useEffect, useState, useMemo, useCallback } from "react";
import MIRROR_URLS from "./config/mirrors";
import Icon from './Icon';

const PROTO_REGEX = /(^https?:)?\/\//;

const STATUS_MAPPING = {
  S: 'Success',
  P: 'Paused',
  Y: 'Syncing',
  F: 'Failed',
  N: 'New',
  U: 'Unknown',
}

const Group = React.memo(({ group, entries }) => {
  const [collapse, setCollapse] = useState(true);
  const toggleCollapse = useCallback(() => setCollapse(c => !c), []);

  const summary = useMemo(() => {
    const mapper = new Map();
    entries.map(({status}) => {
      [...status].map((s) => {
        if(!mapper.has(s)) mapper.set(s, 0);
        mapper.set(s, mapper.get(s) + 1);
      })
    });
    return (
      <h2 class="summary">
        {mapper.has("S") && (
          <span class="success">
            {mapper.get("S")}
            <Icon>done</Icon>
          </span>
        )}
        {mapper.has("Y") && (
          <span class="syncing">
            {mapper.get("Y")}
            <Icon>sync</Icon>
          </span>
        )}
        {mapper.has("F") && (
          <span class="failed">
            {mapper.get("F")}
            <Icon>error</Icon>
          </span>
        )}
        {mapper.has("P") && (
          <span class="paused">
            {mapper.get("P")}
            <Icon>pause</Icon>
          </span>
        )}
        {mapper.has("U") && (
          <span class="unknown">
            {mapper.get("U")}
            <Icon>info</Icon>
          </span>
        )}
      </h2>
    )
  }, [entries]);

  return (
    <div class="group">
      <table id={group} onClick={toggleCollapse}>
        <tr>
          <td>
            <h2 class="heading">
              <a href={`#${group}`}>
                {collapse ? 
                (<Icon>add</Icon>):
                (<Icon>remove</Icon>)
                }
              </a>
              {group}
            </h2>
          </td>
          <td>
              {summary}
          </td>
        </tr>
      </table>
      {entries.map(({ full, help, upstream, desc, status, source }, idx) => (
        <div key={idx} class={collapse ? "collapsed": ""}>
          <a href={full} target="_blank">
            <h3>
              {source}
              {help && (
                <a class="help" href={help} target="_blank">
                  <Icon>help</Icon>
                </a>
              )}
            </h3>
          </a>
          {upstream && (
            <div class="upstream">
              <Icon>outbound</Icon>
              <a href={upstream} target="_blank">{upstream}</a>
            </div>
          )}
          {status && (
            <div class="status">
              <Icon>info</Icon>
              {[...status].map((s) => {
                  return STATUS_MAPPING[s];
              }).join("+") ?? "Unknown"}
            </div>
          )}
          {desc ? (
            <div class="desc">{desc}</div>
          ) : (
            <div class="desc missing">无可奉告</div>
          )}
        </div>
      ))}
    </div>
  );
});

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
      .map(([k, v]) => ({ sortKey: k.toLowerCase(), group: k, entries: v }))
  }, [mirrors]);

  const updateFilter = useCallback((ev) => setFilter(ev.target.value), []);
  const lowerFilter = filter.toLowerCase();
  const begin = performance.now();
  const filtered = grouped
    .map((e) => {
      const filtered = filter !== '' && e.sortKey.indexOf(lowerFilter) === -1
      return { ...e, filtered };
    })
    .sort((a, b) => {
      if(filter !== '') {
        const aFilterDominant = a.sortKey.indexOf(lowerFilter) === 0;
        const bFilterDominant = b.sortKey.indexOf(lowerFilter) === 0;
        if(aFilterDominant !== bFilterDominant) return aFilterDominant ? -1 : 1;
      }

      return a.sortKey.localeCompare(b.sortKey);
    });
  const end = performance.now();
  console.log(`Sort`, end - begin);

  return (
    <main>
      <div class="search">
        <input value={filter} onChange={updateFilter} placeholder="Filter" />
        <Icon>search</Icon>
      </div>

      {filtered.map(({ group, entries, filtered }) => (
        <div class={filtered ? "filtered" : ""} key={group}>
          <Group group={group} entries={entries} />
        </div>
      ))}
    </main>
  );
});

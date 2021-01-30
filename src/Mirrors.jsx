import React, { useEffect, useState, useMemo, useCallback } from "react";
import Icon from './Icon';

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
      <h2 className="summary">
        {mapper.has("S") && (
          <span className="success">
            {mapper.get("S")}
            <Icon>done</Icon>
          </span>
        )}
        {mapper.has("Y") && (
          <span className="syncing">
            {mapper.get("Y")}
            <Icon>sync</Icon>
          </span>
        )}
        {mapper.has("F") && (
          <span className="failed">
            {mapper.get("F")}
            <Icon>error</Icon>
          </span>
        )}
        {mapper.has("P") && (
          <span className="paused">
            {mapper.get("P")}
            <Icon>pause</Icon>
          </span>
        )}
        {mapper.has("U") && (
          <span className="unknown">
            {mapper.get("U")}
            <Icon>info</Icon>
          </span>
        )}
      </h2>
    )
  }, [entries]);

  return (
    <div className="group">
      <table id={group} onClick={toggleCollapse}>
        <tbody>
          <tr>
            <td>
              <h2 className="heading">
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
        </tbody>
      </table>
      {entries.map(({ full, help, upstream, desc, status, source }, idx) => (
        <div key={idx} className={collapse ? "collapsed": ""}>
          <h3>
            <a href={full} target="_blank">
              {source}
            </a>
            {help && (
              <a className="help" href={help} target="_blank">
                <Icon>help</Icon>
              </a>
            )}
          </h3>
          {upstream && (
            <div className="upstream">
              <Icon>outbound</Icon>
              <a href={upstream} target="_blank">{upstream}</a>
            </div>
          )}
          {status && (
            <div className="status">
              <Icon>info</Icon>
              {[...status].map((s) => {
                  return STATUS_MAPPING[s];
              }).join("+") ?? "Unknown"}
            </div>
          )}
          {desc ? (
            <div className="desc">{desc}</div>
          ) : (
            <div className="desc missing">无可奉告</div>
          )}
        </div>
      ))}
    </div>
  );
});

export default React.memo(({ mirrors }) => {
  const [filter, setFilter] = useState('');

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
    <div className="mirrorz">
      <div className="search">
        <input value={filter} onChange={updateFilter} placeholder="Filter" />
        <Icon>search</Icon>
      </div>

      <div className="mirrors">
      {filtered.map(({ group, entries, filtered }) => (
        <div className={filtered ? "filtered" : ""} key={group}>
          <Group group={group} entries={entries} />
        </div>
      ))}
      </div>
    </div>
  );
});

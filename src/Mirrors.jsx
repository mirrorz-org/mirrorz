import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation, useRouteMatch } from "react-router-dom";
import { Element, scroller } from 'react-scroll';
import Icon from './Icon';
import { Summary, statusMapper, statusSum, StatusList } from './Status';

const Group = React.memo(({ group, entries, filtered, defaultCollapse = true }) => {
  const [collapse, setCollapse] = useState(defaultCollapse);
  const toggleCollapse = useCallback(() => setCollapse(c => !c), []);

  const summary = useMemo(() => {
    return (
      <Summary sum={
        statusSum(entries.map(({ status }) => {return statusMapper(status);}))
      } />
    )
  }, [entries]);

  const match = useRouteMatch();

  return (
    <div className={"group" + (filtered ? " filtered" : "") + (collapse ? "" : " group-expanded")}>
      <Link to={`${match.url}/${group.replace(/\s/g, '')}`}>
        <div className="group-header" id={group} onClick={toggleCollapse}>
          <Element name={group.replace(/\s/g, '')}>
            <h2 className="heading">
              {collapse ?
                (<Icon>add</Icon>) :
                (<Icon>remove</Icon>)
              }
              {group}
            </h2>
          </Element>
          <div>
            {summary}
          </div>
        </div>
      </Link>
      <div className="group-items">
        {collapse == false && entries.map(({ full, help, upstream, desc, status, source, size }, idx) => (
          <div key={idx}>
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
                {upstream}
              </div>
            )}
            {status && (
              <StatusList mapper={statusMapper(status)}/>
            )}
            {size && (
              <div className="size">
                <Icon>save</Icon>
                {size}
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
    </div>
  );
});

export default React.memo(({ mirrors }) => {
  const [filter, setFilter] = useState('');
  const [unfolded, setUnfolded] = useState(null);

  // Clustering
  const grouped = useMemo(() => {
    const mapper = new Map();
    for (const m of mirrors) {
      if (!mapper.has(m.cname)) mapper.set(m.cname, []);
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
      return { ...e, filtered, defaultCollapse: unfolded !== e.group };
    })
    .sort((a, b) => {
      if (filter !== '') {
        const aFilterDominant = a.sortKey.indexOf(lowerFilter) === 0;
        const bFilterDominant = b.sortKey.indexOf(lowerFilter) === 0;
        if (aFilterDominant !== bFilterDominant) return aFilterDominant ? -1 : 1;
      }

      return a.sortKey.localeCompare(b.sortKey);
    });
  const end = performance.now();
  console.log(`Sort`, end - begin);

  const location = useLocation();
  useEffect(() => {
    const pathnames = location.pathname.split("/")
    if (pathnames.length < 3) // "", "list", "repo"
      return;
    const group = pathnames[2];
    setUnfolded(group);
    scroller.scrollTo(group, {
      duration: 500,
      smooth: true,
      offset: -220, // TODO: use the real header height
    });
  }, [location, filtered]);

  return (
    <div className={"mirrorz"}>
      <div className="search">
        <input value={filter} onChange={updateFilter} placeholder="Filter" />
        <Icon>search</Icon>
      </div>

      <div className="mirrors">
        {filtered.map(({ group, entries, filtered, defaultCollapse }) => (
          <Group key={group} filtered={filtered} group={group} entries={entries} defaultCollapse={defaultCollapse} />
        ))}
      </div>
    </div>
  );
});

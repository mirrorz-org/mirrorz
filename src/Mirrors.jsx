import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation, useRouteMatch, useHistory } from "react-router-dom";
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
  const [filterInit, setFilterInit] = useState(false);
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

  const history = useHistory();

  const updateFilter = useCallback((ev) => setFilter(ev.target.value), []);
  const uploadFilter = useCallback((ev) => {
    if (ev.key === 'Enter')
      history.push({ search: "?filter=" + encodeURIComponent(ev.target.value) });
  }, []);

  const regex = useMemo(() => {
    let regex;
    try {
      if (filter === '')
        regex = null;
      else
        // user input may be invalid regex
        regex = new RegExp(filter);
    } catch (error) {
      regex = null;
    }
    if(regex !== null) console.log("valid regex:", regex);
    return regex;
  }, [filter]);
  const begin = performance.now();
  const filtered = grouped
    .map((e) => {
      let m = null;
      let filtered = false;
      let index = 1e15;
      if (regex !== null) {
        m = regex.exec(e.group);
        filtered = m === null;
        if (!filtered)
          index = m.index;
      }
      return { ...e, filtered, index, defaultCollapse: unfolded !== e.group };
    })
    .sort((a, b) => {
      if (a.index == b.index)
        return a.sortKey.localeCompare(b.sortKey);
      return a.index - b.index;
    });
  const end = performance.now();
  console.log(`Sort`, end - begin);

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  useEffect(() => {
    if (query.get("filter") && !filterInit) {
      // use url filter only once
      setFilterInit(true);
      setFilter(decodeURIComponent(query.get("filter")));
    }
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
        <input value={filter} onChange={updateFilter} onKeyDown={uploadFilter} placeholder="Filter (Support regex)" />
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

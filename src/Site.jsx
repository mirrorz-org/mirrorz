import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useLocation, useRouteMatch } from "react-router-dom";
import Icon from './Icon';

const Summary = React.memo(({ parsed, num }) => {
  const mapper = new Map();
  parsed.map(({status}) => {
    [...status].map((s) => {
      if(!mapper.has(s)) mapper.set(s, 0);
      mapper.set(s, mapper.get(s) + 1);
    })
  });
  return (
    <h2 className="summary">
      {mapper.has("S") && (
        <span className="success">
          {num && mapper.get("S")}
          <Icon>done</Icon>
        </span>
      )}
      {mapper.has("Y") && (
        <span className="syncing">
          {num && mapper.get("Y")}
          <Icon>sync</Icon>
        </span>
      )}
      {mapper.has("F") && (
        <span className="failed">
          {num && mapper.get("F")}
          <Icon>error</Icon>
        </span>
      )}
      {mapper.has("P") && (
        <span className="paused">
          {num && mapper.get("P")}
          <Icon>pause</Icon>
        </span>
      )}
      {mapper.has("U") && (
        <span className="unknown">
          {num && mapper.get("U")}
          <Icon>info</Icon>
        </span>
      )}
    </h2>
  )
})

const MetaLine = React.memo(({ left, right, link = false }) => (
  <div className="meta-line">
    <span className="meta-left">{left}:</span>
    {link ? (<a href={right}><span className="meta-right">{right}</span></a>) : (<span className="meta-right">{right}</span>) }
  </div>
));

const Meta = React.memo(({ site }) => (
  <div className="site-meta">
    {site.url && (<MetaLine left="URL" right={site.url} link={true} />)}
    {site.name && (<MetaLine left="Name" right={site.name} />)}
    {site.homepage && (<MetaLine left="Homepage" right={site.homepage} link={true} />)}
    {site.issue && (<MetaLine left="Issue" right={site.issue} link={true} />)}
    {site.request && (<MetaLine left="Mirror Request" right={site.request} link={true} />)}
    {site.email && (<MetaLine left="Email" right={site.email} />)}
    {site.group && (<MetaLine left="Group" right={site.group} />)}
    {site.note && (<MetaLine left="Note" right={site.note} />)}
  </div>
));

export default React.memo(({ site }) => {
  const [curr, setCurr] = useState("BFSU"); // w/o whitespaces

  const location = useLocation();
  useEffect(() => {
    const pathnames = location.pathname.split("/")
    if (pathnames.length < 3)
      return;
    setCurr(pathnames[2]);
  }, [location]);

  const match = useRouteMatch();

  return (
    <div className="site">
      <div className="site-abbr">
        {site.map(({ site, parsed }, idx) => (
          <Link to={`${match.url}/${site.abbr.replace(/\s/g, '')}`} key={idx}>
            <div className={"group-header" + (site.abbr.replace(/\s/g, '') == curr ? " active" : "")} onClick={() => setCurr(site.abbr)}>
              <img src={site.logo} className="logo"/>
              <h2 className="heading">
                {site.abbr}
              </h2>
              <div>
                <Summary parsed={parsed} num={true}/>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {site.map(({ site, parsed }) => {
        if (site.abbr.replace(/\s/g, '') != curr)
          return;
        return (
          <div className="site-content">
            <Meta site={site}/>
            <div className="site-mirrors">
            {parsed.map(({ cname, status }, idx) => (
              <div className="group-header" key={idx}>
                <h2 className="heading">
                  {cname}
                </h2>
                <div>
                  <Summary parsed={[{ status }]} num={false}/>
                </div>
              </div>
            ))}
            </div>
          </div>)
      })}
    </div>
  );
});

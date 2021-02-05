import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useLocation, useRouteMatch } from "react-router-dom";
import { Logo } from './Icon';
import { Summary, statusMapper, statusSum, StatusList } from './Status';

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
    {site.disk && (<MetaLine left="Disk" right={site.disk} />)}
    {site.issue && (<MetaLine left="Issue" right={site.issue} link={true} />)}
    {site.request && (<MetaLine left="Mirror Request" right={site.request} link={true} />)}
    {site.email && (<MetaLine left="Email" right={site.email} />)}
    {site.group && (<MetaLine left="Group" right={site.group} />)}
    {site.note && (<MetaLine left="Note" right={site.note} />)}
  </div>
));

export default React.memo(({ site }) => {
  const [curr, setCurr] = useState("BFSU"); // w/o whitespaces
  const [stat, setStat] = useState(""); // get filter from url

  const location = useLocation();
  useEffect(() => {
    const pathnames = location.pathname.split("/")
    if (pathnames.length < 3)
      return;
    setCurr(pathnames[2]);
    if (pathnames.length < 4)
      return;
    setStat(pathnames[3]);
  }, [location]);

  const match = useRouteMatch();

  return (
    <div className="site">
      <div className="site-abbr">
        {site.sort((a, b) => a.site.abbr.localeCompare(b.site.abbr)).map(({ site, parsed }, idx) => (
          <Link to={`${match.url}/${site.abbr.replace(/\s/g, '')}`} key={idx}>
            <div className={"group-header" + (site.abbr.replace(/\s/g, '') == curr ? " active" : "")} onClick={() => setCurr(site.abbr)}>
              <Logo site={site} className="logo"/>
              <h2 className="heading">
                {site.abbr}
              </h2>
              <div>
                <Summary sum={
                  statusSum(parsed.map(({ status }) => {return statusMapper(status);}))
                } />
              </div>
            </div>
          </Link>
        ))}
      </div>
      {site.map(({ site, parsed }) => {
        if (site.abbr.replace(/\s/g, '') != curr)
          return;
        return (
          <div className="site-content" key={site}>
            <Meta site={site}/>
            <div className="site-mirrors">
            {parsed.map(({ cname, status }, idx) => {
              if (stat !== "" && status && status.indexOf(stat) === -1)
                return;
              return (<div className="site-group" key={idx}>
                <h2 className="heading">
                  {cname}
                </h2>
                <StatusList mapper={statusMapper(status)}/>
              </div>);
            })}
            </div>
          </div>)
      })}
    </div>
  );
});

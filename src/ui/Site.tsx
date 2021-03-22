import React from "react";
import { generatePath, Link, useHistory, useParams, useRouteMatch } from "react-router-dom";
import { Logo } from './Icon';
import { Summary, statusMapper, statusSum, StatusList } from './Status';
import { ParsedMirror, Site } from "../schema";

type SiteRouteParams = {
  siteSlug?: string,
  statusFilter?: string
};

const MetaLine = React.memo(({ left, right, link = false }: { left: string, right: string, link?: boolean }) => (
  <div className="meta-line">
    <span className="meta-left">{left}:</span>
    {link ? (<a href={right}><span className="meta-right">{right}</span></a>) : (<span className="meta-right">{right}</span>)}
  </div>
));

const Meta = React.memo(({ site }: { site: Site }) => (
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

const siteUrl = (path: string, site: Site) => generatePath(path, { siteSlug: site.abbr.replace(/\s/g, '') });

export default React.memo(({ site }: { site: { site: Site, parsed: ParsedMirror[] }[] }) => {
  const history = useHistory(), match = useRouteMatch(), params = useParams() as SiteRouteParams;
  const curr = params.siteSlug, stat = params.statusFilter ?? "";

  return (
    <div className="site">
      <div className="site-abbr">
        {site.map(({ site, parsed }, idx) => (
          <Link to={siteUrl(match.path, site)} key={idx}>
            <div className={"group-header" + (site.abbr.replace(/\s/g, '') == curr ? " active" : "")}
              onClick={() => history.push(siteUrl(match.path, site))}>
              <Logo site={site} className="logo" />
              <h2 className="heading">
                {site.abbr}
              </h2>
              <div>
                <Summary sum={statusSum(parsed.map(({ status }) => statusMapper(status)))} />
              </div>
            </div>
          </Link>
        ))}
      </div>
      {site.filter(s => s.site.abbr.replace(/\s/g, '') === curr).map(({ site, parsed }) =>
        <div className="site-content" key={site.abbr}>
          <Meta site={site} />
          <div className="site-mirrors">
            {parsed.sort((a, b) => a.cname.localeCompare(b.cname))
              // Status filter from URL
              .filter(m => stat === "" || !m.status || m.status.indexOf(stat) !== -1)
              .map(({ cname, status }, idx) =>
                <div className="site-group" key={idx}>
                  <h2 className="heading">
                    {cname}
                  </h2>
                  <StatusList mapper={statusMapper(status)} />
                </div>)}
          </div>
        </div>)}
    </div>
  );
});

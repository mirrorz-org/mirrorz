import React from "react";
import { useTranslation } from 'react-i18next';
import { generatePath, Link, useHistory, useParams, useRouteMatch } from "react-router-dom";
import Icon, { Logo } from './Icon';
import { Summary, statusMapper, statusSum, StatusList } from './Status';
import { ParsedMirror, Site } from "../schema";
import { RepoScoring } from "../schema/scoring";

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



const Meta = React.memo(({ site, score }: { site: Site, score?: RepoScoring }) => {
  const { t, i18n } = useTranslation();

  function TagFromScore(score: RepoScoring) {
    let tags = [];
    // score.pos is not used by the frontend
    if (score.mask > 0) {
        tags.push(t("tag.mask"));
    }
    if (score.isp > 0) {
        tags.push(t("tag.isp"));
    }
    if (score.geo < 200) { // 200km
        tags.push(t("tag.geo"));
    }
    return tags.join("/");
  }

  const tag = score ? TagFromScore(score) : "";
  return (
    <div className="site-meta">
      {site.url && (<MetaLine left={t("site.url")} right={site.url} link={true} />)}
      {site.name && (<MetaLine left={t("site.name")} right={site.name} />)}
      {site.homepage && (<MetaLine left={t("site.homepage")} right={site.homepage} link={true} />)}
      {site.disk && (<MetaLine left={t("site.disk")} right={site.disk} />)}
      {site.issue && (<MetaLine left={t("site.issue")} right={site.issue} link={true} />)}
      {site.request && (<MetaLine left={t("site.request")} right={site.request} link={true} />)}
      {site.email && (<MetaLine left={t("site.email")} right={site.email} />)}
      {site.group && (<MetaLine left={t("site.group")} right={site.group} />)}
      {site.note && (<MetaLine left={t("site.note")} right={site.note} />)}
      {score && tag && (<MetaLine left={t("site.note")} right={tag} />)}
    </div>
  );
});

const siteUrl = (path: string, site: Site) => generatePath(path, { siteSlug: site.abbr.replace(/\s/g, '') });

export default React.memo(({ site }: { site: { site: Site, parsed: ParsedMirror[], score?: RepoScoring }[] }) => {
  const history = useHistory(), match = useRouteMatch(), params = useParams() as SiteRouteParams;
  const curr = params.siteSlug, stat = params.statusFilter;

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
      {site.filter(s => s.site.abbr.replace(/\s/g, '') === curr).map(({ site, parsed, score }) =>
        <div className="site-content" key={site.abbr}>
          <Meta site={site} score={score} />
          <div className="site-mirrors">
            {parsed.sort((a, b) => a.cname.localeCompare(b.cname))
              // Status filter from URL
              .filter(m => stat === undefined || !m.status || m.status.indexOf(stat) !== -1)
              .map(({ cname, status, upstream }, idx) =>
                <div className="site-group" key={idx}>
                  <h2 className="heading">
                    {cname}
                  </h2>
                  <div>
                    {stat && upstream && (
                      <div className="upstream">
                        <Icon>outbound</Icon>
                        {upstream}
                      </div>
                    )}
                    {status && (<StatusList mapper={statusMapper(status)} />)}
                  </div>
                </div>)}
          </div>
        </div>)}
    </div>
  );
});

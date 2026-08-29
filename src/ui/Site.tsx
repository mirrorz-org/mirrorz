import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  generatePath,
  Link,
  useHistory,
  useParams,
  useRouteMatch,
} from "react-router-dom";
import Icon, { Logo } from "./Icon";
import { Summary, statusMapper, statusSum, StatusList } from "./Status";
import { ParsedMirror, Site } from "../schema";
import { RepoScoring } from "../schema/scoring";
import { RedirectBadge } from "./RedirectBadge";

type SiteRouteParams = {
  siteSlug?: string;
  statusFilter?: string;
};

const MetaLine = React.memo(
  ({
    left,
    right,
    link = false,
  }: {
    left: string;
    right: string;
    link?: boolean;
  }) => (
    <div className="meta-line">
      <span className="meta-left">{left}:</span>
      {link ? (
        <a href={right}>
          <span className="meta-right">{right}</span>
        </a>
      ) : (
        <span className="meta-right">{right}</span>
      )}
    </div>
  )
);

const Meta = React.memo(
  ({ site, score }: { site: Site; score?: RepoScoring }) => {
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
      if (score.geo < 200) {
        // 200km
        tags.push(t("tag.geo"));
      }
      return tags.join("/");
    }

    const tag = score ? TagFromScore(score) : "";
    return (
      <div className="site-meta">
        <h1 className="site-title">
          {site.abbr}
          <RedirectBadge abbr={site.abbr} />
        </h1>
        {site.url && (
          <MetaLine left={t("site.url")} right={site.url} link={true} />
        )}
        {site.name && <MetaLine left={t("site.name")} right={site.name} />}
        {site.homepage && (
          <MetaLine
            left={t("site.homepage")}
            right={site.homepage}
            link={true}
          />
        )}
        {site.disk && <MetaLine left={t("site.disk")} right={site.disk} />}
        {site.issue && (
          <MetaLine left={t("site.issue")} right={site.issue} link={true} />
        )}
        {site.request && (
          <MetaLine left={t("site.request")} right={site.request} link={true} />
        )}
        {site.email && <MetaLine left={t("site.email")} right={site.email} />}
        {site.group && <MetaLine left={t("site.group")} right={site.group} />}
        {site.note && <MetaLine left={t("site.note")} right={site.note} />}
        {score && tag && <MetaLine left={t("site.note")} right={tag} />}
      </div>
    );
  }
);

const siteUrl = (path: string, site: Site) =>
  generatePath(path, { siteSlug: site.abbr.replace(/\s/g, "") });

const SiteDetails = React.memo(
  ({
    site,
    parsed,
    score,
    statusFilter,
  }: {
    site: Site;
    parsed: ParsedMirror[];
    score?: RepoScoring;
    statusFilter?: string;
  }) => {
    const { t } = useTranslation();
    const [repoFilter, setRepoFilter] = useState("");
    const repos = useMemo(
      () =>
        parsed
          .filter(
            (mirror) =>
              statusFilter === undefined ||
              !mirror.status ||
              mirror.status.indexOf(statusFilter) !== -1
          )
          .sort((a, b) => a.cname.localeCompare(b.cname)),
      [parsed, statusFilter]
    );
    const filteredRepos = useMemo(() => {
      const query = repoFilter.trim().toLowerCase();
      if (query === "") return repos;
      return repos.filter(
        ({ cname, upstream }) =>
          cname.toLowerCase().includes(query) ||
          upstream?.toLowerCase().includes(query)
      );
    }, [repoFilter, repos]);

    return (
      <div className="site-content">
        <div className="site-mobile-header">
          <Link to="/site" aria-label={t("site.back")}>
            <Icon>arrow_back</Icon>
            <span>{site.abbr}</span>
          </Link>
        </div>
        <Meta site={site} score={score} />
        <div className="site-repo-toolbar">
          <div className="search site-repo-search">
            <span
              className={"search-leading" + (repoFilter === "" ? " empty" : "")}
            >
              <Icon aria-hidden="true">search</Icon>
            </span>
            <input
              value={repoFilter}
              onChange={(event) => setRepoFilter(event.target.value)}
              placeholder={t("site.filter")}
              aria-label={t("site.filter")}
            />
            <button
              type="button"
              className="search-clear"
              onClick={() => setRepoFilter("")}
              disabled={repoFilter === ""}
              title={t("clear_filter")}
              aria-label={t("clear_filter")}
            >
              <Icon aria-hidden="true">close</Icon>
            </button>
          </div>
          <span className="result-count" role="status">
            {t("site.count", {
              shown: filteredRepos.length,
              total: repos.length,
            })}
          </span>
        </div>
        {filteredRepos.length === 0 ? (
          <p className="site-repo-empty">{t("site.no_results")}</p>
        ) : (
          <div className="site-mirrors">
            {filteredRepos.map(({ cname, status, upstream }, idx) => (
              <div className="site-group" key={idx}>
                <h2 className="heading">{cname}</h2>
                <div>
                  {statusFilter && upstream && (
                    <div className="upstream">
                      <Icon>outbound</Icon>
                      {upstream}
                    </div>
                  )}
                  {status && <StatusList mapper={statusMapper(status)} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

export default React.memo(
  ({
    site,
  }: {
    site: { site: Site; parsed: ParsedMirror[]; score?: RepoScoring }[];
  }) => {
    const { t } = useTranslation();
    const history = useHistory(),
      match = useRouteMatch(),
      params = useParams() as SiteRouteParams;
    const curr = params.siteSlug,
      stat = params.statusFilter;

    return (
      <div className={"site" + (curr ? " has-selection" : "")}>
        <div className="site-abbr">
          {site.map(({ site, parsed }, idx) => (
            <Link to={siteUrl(match.path, site)} key={idx}>
              <div
                className={
                  "group-header" +
                  (site.abbr.replace(/\s/g, "") == curr ? " active" : "")
                }
                onClick={() => history.push(siteUrl(match.path, site))}
              >
                <Logo site={site} className="logo" />
                <h2 className="heading">
                  {site.abbr}
                  <RedirectBadge abbr={site.abbr} />
                </h2>
                <div>
                  <Summary
                    sum={statusSum(
                      parsed.map(({ status }) => statusMapper(status))
                    )}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
        {site
          .filter((s) => s.site.abbr.replace(/\s/g, "") === curr)
          .map(({ site, parsed, score }) => (
            <SiteDetails
              key={site.abbr}
              site={site}
              parsed={parsed}
              score={score}
              statusFilter={stat}
            />
          ))}
      </div>
    );
  }
);

import React from "react";
import { useTranslation } from "react-i18next";
import Icon, { Logo } from "./Icon";
import { ParsedMirror, Site } from "../schema";

import config from "../config/config.json";

const Para = React.memo(
  ({
    title,
    icon,
    description,
    content,
    html,
  }: {
    title: string;
    icon: string;
    description: string;
    content?: React.ReactNode;
    html?: string;
  }) => {
    return (
      <div className="para">
        <div className="para-title">
          <div className="para-title-icon">
            <Icon aria-hidden="true">{icon}</Icon>
          </div>
          <div className="para-title-text">{title}</div>
        </div>
        <p className="para-description">{description}</p>
        {content && <div className="para-content">{content}</div>}
        {html && (
          <div
            className="para-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    );
  }
);

const GuideItem = React.memo(
  ({ title, description }: { title: string; description: string }) => (
    <li className="about-guide-item">
      <h3>{title}</h3>
      <p>{description}</p>
    </li>
  )
);

const UrlList = React.memo(({ urls }: { urls: string[] }) => (
  <ul className="about-url-list">
    {urls.map((url) => (
      <li key={url}>
        <a href={url}>{url}</a>
      </li>
    ))}
  </ul>
));

export default React.memo(
  ({ site }: { site: { site: Site; parsed: ParsedMirror[] }[] }) => {
    const { t } = useTranslation();
    const validUrls = [
      `${config.url}/`,
      `${config.url}/os/ArchLinux`,
      `${config.url}/app/Git`,
      `${config.url}/font`,
      `${config.url}/list`,
      `${config.url}/list/pypi`,
      `${config.url}/list/[0-9]+`,
      `${config.url}/site`,
      `${config.url}/site/BFSU`,
      `${config.url}/site/TUNA/Y`,
      `${config.url}/about`,
      ...(config.about.includes("monitor") ? [`${config.url}/monitor`] : []),
    ];

    return (
      <div className="about">
        <div className="about-col">
          <h1 className="about-title">{config.display || "MirrorZ"}</h1>
          <Para
            title={t("about.overview")}
            icon="info_outline"
            description={t("about.overview_description")}
            html={config.intro}
          />
          <Para
            title={t("about.guide")}
            icon="explore"
            description={t("about.guide_description")}
            content={
              <ul className="about-guide">
                <GuideItem
                  title={t("about.guide_download")}
                  description={t("about.guide_download_description")}
                />
                <GuideItem
                  title={t("about.guide_list")}
                  description={t("about.guide_list_description")}
                />
                <GuideItem
                  title={t("about.guide_site")}
                  description={t("about.guide_site_description")}
                />
                {config.mirrors_help_url && (
                  <GuideItem
                    title={t("about.guide_help")}
                    description={t("about.guide_help_description")}
                  />
                )}
              </ul>
            }
          />
          <Para
            title={t("about.participants")}
            icon="favorite_border"
            description={t("about.participants_description")}
            content={
              <div className="about-participants">
                {site.map(({ site }) => (
                  <div className="about-powered-by" key={site.abbr}>
                    <Logo site={site} className="about-logo" />
                    {site.abbr}
                  </div>
                ))}
              </div>
            }
          />
          <Para
            title={t("about.project")}
            icon="code"
            description={t("about.project_description")}
            content={
              <a
                href="https://github.com/mirrorz-org/mirrorz"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://github.com/mirrorz-org/mirrorz
              </a>
            }
          />
          <Para
            title={t("about.advanced")}
            icon="build"
            description={t("about.advanced_description")}
            content={
              <ul className="about-features">
                {config.about.includes("mirrors_help") && (
                  <li>
                    <h3>{t("about.mirrors_help")}</h3>
                    <p>{t("about.mirrors_help_description")}</p>
                    <UrlList urls={[config.mirrors_help_url]} />
                  </li>
                )}
                <li>
                  <h3>{t("about.valid_urls")}</h3>
                  <p>{t("about.valid_urls_description")}</p>
                  <UrlList urls={validUrls} />
                </li>
                {config.about.includes("monitor") && (
                  <li>
                    <h3>{t("about.monitor")}</h3>
                    <p>{t("about.monitor_description")}</p>
                    <UrlList urls={[`${config.url}/monitor`]} />
                  </li>
                )}
                {config.about.includes("302-js") && (
                  <li>
                    <h3>{t("about.302_js")}</h3>
                    <p>{t("about.302_js_description")}</p>
                    <UrlList
                      urls={[
                        "https://mirrors.mirrorz.org/archlinux",
                        "https://m.mirrorz.org/centos",
                      ]}
                    />
                  </li>
                )}
                {config.about.includes("search") && (
                  <li>
                    <h3>{t("about.search")}</h3>
                    <p>{t("about.search_description")}</p>
                    <UrlList
                      urls={[
                        "https://search.mirrorz.org/archlinux/",
                        "https://s.mirrorz.org/openwrt/snapshots/targets/zynq/generic/sha256sums",
                      ]}
                    />
                  </li>
                )}
                {config.about.includes("302-go") && (
                  <li>
                    <h3>{t("about.302_go")}</h3>
                    <p>{t("about.302_go_description")}</p>
                    {config.about.includes("mirrors_help") && (
                      <UrlList urls={[config.mirrors_help_url]} />
                    )}
                  </li>
                )}
              </ul>
            }
          />
        </div>
      </div>
    );
  }
);

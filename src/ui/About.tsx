import React from "react";
import { useTranslation } from 'react-i18next';
import { Logo } from "./Icon";
import { ParsedMirror, Site } from "../schema";

import config from "../config/config.json";

const Para = React.memo(({ title, content, html }: { title: string, content: React.ReactNode, html: string }) => {
  return (
    <div className="para">
      <div className="para-title">
        <div className="para-title-icon">#</div>
        <div className="para-title-text">{title}</div>
      </div>
      {content && (<div className="para-content">
        {content}
      </div>)}
      {html && (<div className="para-content" dangerouslySetInnerHTML={{__html: html}} />)}
    </div>
  )
});

export default React.memo(({ site }: { site: { site: Site, parsed: ParsedMirror[] }[] }) => {
  const { t, i18n } = useTranslation();
  return (
    <div className="about">
      <Para title={t("about.intro")} html={config.intro} />
      <Para title={t("about.repo")} content={(
        <a href="https://github.com/mirrorz-org/mirrorz" target="_blank">https://github.com/mirrorz-org/mirrorz</a>
      )} />
      <Para title={t("about.logo")} content={site.map(({ site, parsed }, idx) => (
        <div className="about-powered-by" key={site.abbr}>
          <Logo site={site} className="about-logo" />
          {site.abbr}
        </div>
      ))}
      />
      <Para title={t("about.usage")} content={(
        <ul>
          <li>{t("about.valid_urls")}</li>
            <ul>
              <li>{config.url}/</li>
              <li>{config.url}/os/ArchLinux</li>
              <li>{config.url}/app/Git</li>
              <li>{config.url}/font</li>
              <li>{config.url}/list</li>
              <li>{config.url}/list/pypi</li>
              <li>{config.url}/list/[0-9]+</li>
              <li>{config.url}/site</li>
              <li>{config.url}/site/BFSU</li>
              <li>{config.url}/site/OpenTUNA/Y</li>
              <li>{config.url}/about</li>
              { config.about.includes("monitor") && (<li>{config.url}/monitor</li>) }
            </ul>
          { config.about.includes("legacy") && (<>
            <li>{t("about.legacy")}</li>
              <ul>
                <li>{config.url}/_/</li>
                <li>{config.url}/_/about</li>
                <li>{t("about.legacy_usage")}</li>
              </ul>
          </>)}
          { config.about.includes("oh-my-mirrorz") && (<>
            <li>{t("about.speedtest")}</li>
              <ul>
                <li>{config.url}/oh-my-mirrorz.py</li>
                <li><code>curl {config.url}/oh-my-mirrorz.py | python3</code></li>
                <li><code>curl {config.url}/oh-my-mirrorz.py | nix-shell -p python39 -p python39Packages.requests --run python</code></li>
              </ul>
          </>)}
          { config.about.includes("302-js") && (<>
            <li>{t("about.302_js")}</li>
              <ul>
                <li>https://mirrors.mirrorz.org/archlinux</li>
                <li>https://m.mirrorz.org/centos</li>
              </ul>
          </>)}
          { config.about.includes("search") && (<>
            <li>{t("about.search")}</li>
              <ul>
                <li>https://search.mirrorz.org/archlinux/</li>
                <li>https://s.mirrorz.org/openwrt/snapshots/targets/zynq/generic/sha256sums</li>
              </ul>
          </>)}
          { config.about.includes("302-go") && (<>
            <li>{t("about.302_go")}</li>
              <ul>
                <li>Arch Linux: <code>Server = {config.url}/archlinux/$repo/os/$arch</code></li>
                <li>Debian: <code>deb {config.url}/debian/ bullseye main contrib non-free</code></li>
                <li>Ubuntu: <code>deb {config.url}/ubuntu/ focal main restricted universe multiverse</code></li>
                <li>CentOS/Fedora: <code>baseurl={config.url}</code></li>
                <li>{t("about.302_go_more")}</li>
              </ul>
          </>)}
        </ul>
      )} />
    </div>
  );
});

import React from "react";
import { Logo } from "./Icon";
import { ParsedMirror, Site } from "../schema";

const Para = React.memo(({ title, content }: { title: string, content: React.ReactNode }) => {
  return (
    <div className="para">
      <div className="para-title">
        <div className="para-title-icon">#</div>
        <div className="para-title-text">{title}</div>
      </div>
      <div className="para-content">
        {content}
      </div>
    </div>
  )
});

export default React.memo(({ site }: { site: { site: Site, parsed: ParsedMirror[] }[] }) => {
  return (
    <div className="about">
      <Para title="Intro" content={(
        <div>
          <p>Your next MirrorS is not MirrorS, nor MirrorSes, it's MirrorZ.</p>
          <p>A final site for Mirror sites.</p>
        </div>
      )} />
      <Para title="Repo" content={(
        <a href="https://github.com/tuna/mirrorz" target="_blank">https://github.com/tuna/mirrorz</a>
      )} />
      <Para title="Logo" content={site.map(({ site, parsed }, idx) => (
        <div className="about-powered-by" key={site.abbr}>
          <Logo site={site} className="about-logo" />
          {site.abbr}
        </div>
      ))}
      />
      <Para title="Usage" content={(
        <ul>
          <li>The following urls are all valid.</li>
          <li>https://mirrorz.org/</li>
          <li>https://mirrorz.org/os/ArchLinux</li>
          <li>https://mirrorz.org/app/Git</li>
          <li>https://mirrorz.org/font</li>
          <li>https://mirrorz.org/list</li>
          <li>https://mirrorz.org/list/pypi</li>
          <li>https://mirrorz.org/list/%5B0-9%5D%2B</li>
          <li>https://mirrorz.org/site</li>
          <li>https://mirrorz.org/site/BFSU</li>
          <li>https://mirrorz.org/site/OpenTUNA/Y</li>
          <li>https://mirrorz.org/about</li>
          <li>https://mirrorz.org/monitor</li>
          <li>The following urls are for static webpage, you can use w3m/lynx to view them</li>
          <li>https://mirrorz.org/_/</li>
          <li>https://mirrorz.org/_/about</li>
          <li>More usage of static webpage is documented in the above url</li>
          <li>Use the below script for speed test!</li>
          <li>https://mirrorz.org/oh-my-mirrorz.py</li>
          <li><code>curl https://mirrorz.org/oh-my-mirrorz.py | python3</code></li>
          <li>Experimental Feature: Backend</li>
          <li>https://mirrors.mirrorz.org/archlinux</li>
          <li>https://m.mirrorz.org/centos</li>
        </ul>
      )} />
      <Para title="TODO and possible projects" content={(
        <ul>
          <li>More participating mirrors</li>
          <li>oh-my-mirrorz. One script to change all your mirrors (currently only speedtest was implemented). Ref to <a href="http://github.com/tuna/oh-my-tuna" target="_blank">http://github.com/tuna/oh-my-tuna</a></li>
          <li>Load Balancing Backend (hard). Ref to <a href="http://github.com/tuna/mirrorhub" target="_blank">http://github.com/tuna/mirrorhub</a>. Currently a experimental backend is deployed.</li>
          <li>Mobile browser support</li>
          <li>i18n/l10n</li>
          <li>mirrorz.json protocol/data format discussion and upgrade</li>
        </ul>
      )} />
    </div>
  );
});

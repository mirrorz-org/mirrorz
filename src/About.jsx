import React from "react";
import { Logo } from "./Icon";

const Para = React.memo(({ title, content }) => {
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

export default React.memo(({ site }) => {
  return (
    <div className="about">
      <Para title="Intro" content={
			  "Your next MirrorS is not MirrorS, nor MirrorSes, it\'s MirrorZ."
			} />
      <Para title="Repo" content={(
			  <a href="https://github.com/tuna/mirrorz" target="_blank">https://github.com/tuna/mirrorz</a>
      )} />
      <Para title="Powered by" content={site.sort((a, b) => a.site.abbr.localeCompare(b.site.abbr)).map(({ site, parsed }, idx) => (
          <div className="about-powered-by" key={site.abbr}>
            <Logo site={site} className="about-logo"/>
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
          <li>https://mirrorz.org/list?filter=%5B0-9%5D%2B</li>
          <li>https://mirrorz.org/list/AUR?filter=B</li>
          <li>https://mirrorz.org/site</li>
          <li>https://mirrorz.org/site/BFSU</li>
          <li>https://mirrorz.org/site/OpenTUNA/Y</li>
          <li>https://mirrorz.org/about</li>
        </ul>
      )} />
      <Para title="TODO and possible projects" content={(
        <ul>
          <li>More participating mirrors</li>
          <li>oh-my-mirrorz. One script to change all your mirrors. Ref to <a href="http://github.com/tuna/oh-my-tuna" target="_blank">http://github.com/tuna/oh-my-tuna</a></li>
          <li>Load Balancing Backend (hard). Ref to <a href="http://github.com/tuna/mirrorhub" target="_blank">http://github.com/tuna/mirrorhub</a></li>
          <li>Mobile browser support</li>
          <li>i18n/l10n</li>
          <li>Static site generation for w3m (tty friendly frontend)</li>
          <li>mirrorz.json protocol/data format discussion and upgrade</li>
        </ul>
      )} />
    </div>
  );
});

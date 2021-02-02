import React from "react";

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
			  <a>https://github.com/tuna/mirrorz</a>
      )} />
      <Para title="Powered by" content={site.map(({ site, parsed }, idx) => {
        if(site.logo && site.logo !== "")
          return (
            <div className="about-powered-by" key={site.abbr}>
              <img src={site.logo} className="about-logo" title={site.abbr}/>
              {site.abbr}
            </div>
          )
        })}
      />
      <Para title="TODO and possible projects" content={(
        <ul>
          <li>More participating mirrors</li>
          <li>oh-my-mirrorz. One script to change all your mirrors. Ref to <a>http://github.com/tuna/oh-my-tuna</a></li>
          <li>Load Balancing Backend (hard). Ref to <a>http://github.com/tuna/mirrorhub</a></li>
          <li>i18n/l10n</li>
          <li>Static site generation for w3m (tty friendly frontend)</li>
          <li>mirrorz.json protocol/data format discussion and upgrade</li>
        </ul>
      )
      } />
    </div>
  );
});

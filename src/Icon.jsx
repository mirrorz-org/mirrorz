import React from 'react';

export default React.memo(({ children }) => <i className="material-icons">{children}</i>);

export const Logo = React.memo(({ site, className }) => {
  let logo_darkmode = null;
  let logo = null;
  if (site.logo_darkmode && site.logo_darkmode !== "") {
    logo_darkmode = site.logo_darkmode;
  }
  if (site.logo && site.logo !== "") {
    logo = site.logo;
  }

  if (logo !== null)
    return (
      <picture>
        {logo_darkmode && (<source srcset={logo_darkmode} media="(prefers-color-scheme: dark)" />)}
        <img src={logo} title={site.abbr} className={className} />
      </picture>
    );
});

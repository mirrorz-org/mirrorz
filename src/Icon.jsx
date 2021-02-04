import React from 'react';

export default React.memo(({ children }) => <i className="material-icons">{children}</i>);

export const Logo = React.memo(({ site, className }) => {
  let logo = null;
  // https://stackoverflow.com/questions/56393880/how-do-i-detect-dark-mode-using-javascript
  // dark mode and has dark logo
  if (site.logo_darkmode && site.logo_darkmode !== ""  && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    logo = site.logo_darkmode;
  } else if (site.logo && site.logo !== "") {
    logo = site.logo;
  }

  if (logo !== null)
    return (<img src={logo} title={site.abbr} className={className} />);
});

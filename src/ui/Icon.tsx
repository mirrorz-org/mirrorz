import React from 'react';
import { Site } from "../schema";

export default React.memo(({ children, ...rest }: React.HTMLAttributes<HTMLElement> & { children: React.ReactNode }) =>
  <i className="material-icons" {...rest}>{children}</i>);

export const Logo = React.memo(({ site, className }: { site: Site, className: string }) => {
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
        {logo_darkmode && (<source srcSet={logo_darkmode} media="(prefers-color-scheme: dark)" />)}
        <img src={logo} title={site.abbr} className={className} />
      </picture>
    );
  else
    return (<div></div>);
});

export const Logo404 = React.memo(({ logo, str }: { logo: boolean, str: string }) => {
  return (
    <div className="logo-404">
      {logo && (<img src="/static/img/mirrorz-404.svg"></img>)}
      <div>{str}</div>
    </div>
  )
});

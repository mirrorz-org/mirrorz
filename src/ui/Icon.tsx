import React, { useContext, useEffect, useState } from "react";
import { Site } from "../schema";
import { ThemeContext } from "./theme";

export default React.memo(
  ({
    children,
    ...rest
  }: React.HTMLAttributes<HTMLElement> & { children: React.ReactNode }) => (
    <i className="material-icons" {...rest}>
      {children}
    </i>
  )
);

export const Logo = React.memo(
  ({ site, className }: { site: Site; className: string }) => {
    const theme = useContext(ThemeContext);
    const [failed, setFailed] = useState(false);
    let logo_darkmode = null;
    let logo = null;
    if (site.logo_darkmode && site.logo_darkmode !== "") {
      logo_darkmode = site.logo_darkmode;
    }
    if (site.logo && site.logo !== "") {
      logo = site.logo;
    }

    useEffect(() => setFailed(false), [logo, logo_darkmode, theme]);

    if (logo !== null && !failed)
      return (
        <picture>
          {logo_darkmode && (
            <source
              srcSet={logo_darkmode}
              media={theme === "dark" ? "all" : "not all"}
            />
          )}
          <img
            src={logo}
            title={site.abbr}
            className={className + (logo_darkmode ? "" : " logo-plate")}
            onError={() => setFailed(true)}
          />
        </picture>
      );
    else
      return (
        <div className={className + " logo-fallback"} title={site.abbr}>
          {site.abbr.slice(0, 5)}
        </div>
      );
  }
);

export const Logo404 = React.memo(
  ({ logo, str }: { logo: boolean; str: string }) => {
    return (
      <div className="logo-404">
        {logo && <img src="/static/img/mirrorz-404.svg"></img>}
        <div>{str}</div>
      </div>
    );
  }
);

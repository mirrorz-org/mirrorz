import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from "react-router-dom";
import Mirrors from "./Mirrors";
import ISO from "./ISO";
import Site from "./Site";
import About from "./About";
import Debug from "./Debug";
import Monitor from "./Monitor";
import Icon from "./Icon";
import {
  useIsoInfoList,
  useMirrorsList,
  useMirrorzSites,
  useSitesList,
  useScoring,
} from "./hooks";
import { Page404 } from "./404";

import config from "../config/config.json";
import { RedirectSitesContext } from "./RedirectBadge";

// eslint-disable-next-line react/display-name
export default React.memo(() => {
  const { t, i18n } = useTranslation();
  const mirrorz = useMirrorzSites();
  const scoring = useScoring();
  const redirectSites = useMemo(
    () => new Set(scoring?.scores.map(({ abbr }) => abbr) ?? []),
    [scoring]
  );

  const mirrorzList = useMemo(() => Object.values(mirrorz), [mirrorz]);
  const mirrorsList = useMirrorsList(mirrorz);
  const isoinfoList = useIsoInfoList(mirrorz, scoring);
  const siteList = useSitesList(mirrorz, scoring);

  return (
    <RedirectSitesContext.Provider value={redirectSites}>
      <Router>
        <div id="app-container">
          <div className="sidebar">
            <NavLink
              to="/"
              className="sidebar-brand"
              activeClassName="active"
              isActive={(_, location) =>
                location.pathname === "/" || location.pathname === "/about"
              }
            >
              <img
                src="/static/img/mirrorz.svg"
                className="sidebar-logo"
                alt={config.display || "MirrorZ"}
              />
            </NavLink>
            <NavLink
              to="/os"
              activeClassName="active"
              isActive={(_, location) =>
                ["/os", "/app", "/font"].some(
                  (path) =>
                    location.pathname === path ||
                    location.pathname.startsWith(path + "/")
                )
              }
            >
              <Icon aria-hidden="true">get_app</Icon>
              <h2>{t("download")}</h2>
            </NavLink>
            <NavLink to="/list" activeClassName="active">
              <Icon aria-hidden="true">list_alt</Icon>
              <h2>{t("list.list")}</h2>
            </NavLink>
            <NavLink to="/site" activeClassName="active">
              <Icon aria-hidden="true">dns</Icon>
              <h2>{t("site.site")}</h2>
            </NavLink>
            {config.mirrors_help_url && (
              <a href={config.mirrors_help_url} target="_blank" rel="noopener">
                <Icon aria-hidden="true">help_outline</Icon>
                <h2>{t("help")}</h2>
              </a>
            )}
          </div>
          <main>
            <Switch>
              <Route path="/list/:filter?" exact>
                <Mirrors mirrors={mirrorsList} />
              </Route>
              <Route path="/site/:siteSlug?/:statusFilter?" exact>
                <Site site={siteList} />
              </Route>
              <Route path={["/", "/about"]} exact>
                <About site={siteList} />
              </Route>
              <Route path="/debug" exact>
                <Debug mirrorz={mirrorzList} />
              </Route>
              <Route path="/monitor" exact>
                <Monitor />
              </Route>
              <Route path="/:category/:distro?" exact>
                <ISO isoinfo={isoinfoList} />
              </Route>
              <Page404 />
            </Switch>
          </main>
        </div>
      </Router>
    </RedirectSitesContext.Provider>
  );
});

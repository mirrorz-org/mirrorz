import React, { useMemo } from "react";
import { useTranslation } from 'react-i18next';
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
import { useIsoInfoList, useMirrorsList, useMirrorzSites, useSitesList, useScoring } from "./hooks";
import { Page404 } from "./404";
import Icon from "./Icon";

import config from "../config/config.json";

// eslint-disable-next-line react/display-name
export default React.memo(() => {
  const { t, i18n } = useTranslation();
  const mirrorz = useMirrorzSites();
  const scoring = useScoring();

  const mirrorzList = useMemo(() => Object.values(mirrorz), [mirrorz]);
  const mirrorsList = useMirrorsList(mirrorz);
  const isoinfoList = useIsoInfoList(mirrorz);
  const siteList = useSitesList(mirrorz, scoring);

  return (
    <Router>
      <div id="app-container">
        <div className="sidebar">
          <NavLink
            to="/"
            activeClassName="active"
            isActive={(_, location) => {
              if (
                location.pathname === "/" ||
                (!location.pathname.startsWith("/list") &&
                  !location.pathname.startsWith("/site") &&
                  !location.pathname.startsWith("/about") &&
                  !location.pathname.startsWith("/debug") &&
                  !location.pathname.startsWith("/monitor"))
              ) {
                return true;
              }
              return false;
            }}
          >
            <img src="/static/img/mirrorz.svg" className="sidebar-logo" alt="ISO" />
          </NavLink>
          <NavLink to="/list" activeClassName="active">
            <h2 dangerouslySetInnerHTML={{__html: t("list.list")}} />
          </NavLink>
          <NavLink to="/site" activeClassName="active">
            <h2 dangerouslySetInnerHTML={{__html: t("site.site")}} />
          </NavLink>
          {config.mirrorz_help && <a href={config.mirrorz_help} target="_blank">
            <h2 dangerouslySetInnerHTML={{__html: t("help")}} /><Icon>open_in_new</Icon>
          </a>}
          <NavLink to="/about" activeClassName="active">
            <h2>{t("about.about")}</h2>
          </NavLink>
        </div>
        <main>
          <Switch>
            <Route path="/list/:filter?" exact>
              <Mirrors mirrors={mirrorsList} />
            </Route>
            <Route path="/site/:siteSlug?/:statusFilter?" exact>
              <Site site={siteList} />
            </Route>
            <Route path="/about" exact>
              <About site={siteList} />
            </Route>
            <Route path="/debug" exact>
              <Debug mirrorz={mirrorzList} />
            </Route>
            <Route path="/monitor" exact>
              <Monitor />
            </Route>
            <Route path={["/", "/:category?/:distro?"]} exact>
              <ISO isoinfo={isoinfoList} />
            </Route>
            <Page404 />
          </Switch>
        </main>
      </div>
    </Router>
  );
});

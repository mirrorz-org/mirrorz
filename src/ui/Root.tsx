import React, { useMemo } from "react";
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
import { useIsoInfoList, useMirrorsList, useMirrorzSites, useSitesList } from "./hooks";
import { Logo404 } from "./Icon";

// eslint-disable-next-line react/display-name
export default React.memo(() => {
  const mirrorz = useMirrorzSites();

  const mirrorzList = useMemo(() => Object.values(mirrorz), [mirrorz]);
  const mirrorsList = useMirrorsList(mirrorz);
  const isoinfoList = useIsoInfoList(mirrorz);
  const siteList = useSitesList(mirrorz);

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
            <h2>List</h2>
          </NavLink>
          <NavLink to="/site" activeClassName="active">
            <h2>Site</h2>
          </NavLink>
          <NavLink to="/about" activeClassName="active">
            <h2>About</h2>
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
            <Route path={["/", "/:category(os|app|font)/:distro?"]} exact>
              <ISO isoinfo={isoinfoList} />
            </Route>
            <Logo404 logo={true} str={"Navigate with the sidebar"} />
          </Switch>
        </main>
      </div>
    </Router>
  );
});

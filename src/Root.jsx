import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from "react-router-dom";
import MIRROR_URLS from "./config/mirrors";
import Mirrors from "./Mirrors";
import ISO from "./ISO";
import Site from "./Site";

const PROTO_REGEX = /(^https?:)?\/\//;

// eslint-disable-next-line react/display-name
export default React.memo(() => {
  const [mirrors, setMirrors] = useState([]);
  const [isoinfo, setIsoinfo] = useState([]);
  const [site, setSite] = useState([]);

  // Load all mirror configurations
  useEffect(() => {
    async function initMirror(url) {
      const resp = await fetch(url);
      const { site, info, mirrors } = await resp.json();

      const parsed = mirrors.map(
        ({ cname, url, help, abbr, desc, upstream, status }) => {
          const fullUrl = url.match(PROTO_REGEX) ? url : site.url + url;
          const helpUrl =
            help === ""
              ? null
              : help.match(PROTO_REGEX)
              ? help
              : site.url + help;
          return {
            cname,
            full: fullUrl,
            help: helpUrl,
            upstream,
            desc,
            status,
            source: site.abbr,
          };
        }
      );
      setMirrors((original) => original.concat(parsed));

      setSite((original) => original.concat([{ site, parsed }]));

      const fullinfo = info.map(({ category, distro, urls }) => {
        const fullUrls = urls.map(({ name, url }) => {
          return {
            name: name + " [" + site.abbr + "]",
            url: url.match(PROTO_REGEX) ? url : site.url + url,
          };
        });
        return {
          category,
          distro,
          urls: fullUrls,
        };
      });
      setIsoinfo((original) => original.concat(fullinfo));
    }

    // Fires and forget
    for (const mirror of MIRROR_URLS) initMirror(mirror);
  }, []);

  const location = window.location;
  const history = window.history;
  if (location.hash !== "") {
    const hash = location.hash.slice(1);
    history.replaceState(null, "", `${hash}`);
  }

  return (
    <Router>
      <div>
        <div className="sidebar">
          <NavLink 
            to="/"
            activeClassName="active"
            isActive={(_, location) => {
              if (
                location.pathname === "/" ||
                (!location.pathname.startsWith("/list") &&
                !location.pathname.startsWith("/site"))
              ) {
                return true;
              }
              return false;
            }}
          >
            <h2>ISO</h2>
          </NavLink>
          <NavLink to="/list" activeClassName="active">
            <h2>List</h2>
          </NavLink>
          <NavLink to="/site" activeClassName="active">
            <h2>Site</h2>
          </NavLink>
        </div>
        <main>
          <Switch>
            <Route path="/list">
              <Mirrors mirrors={mirrors} />
            </Route>
            <Route path="/site">
              <Site site={site} />
            </Route>
            <Route path="*">
              <ISO isoinfo={isoinfo} />
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  );
});

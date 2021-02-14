import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import Icon, { Logo404 } from './Icon';

const Urls = React.memo(({ isoinfo, category, distro }) => {
  const i = isoinfo.map(({ site, info }) => {
    const i = info.map((i) => {
      if(i.category.replace(/\s/g, '') != category || i.distro.replace(/\s/g, '') != distro)
        return null;
      return (
        <div key={site.abbr}>
          <h3>{site.abbr}</h3>
          <ul>
            {i.urls.map(({ name, url }, idx) => (
              <li key={site.abbr + name + idx}><a href={url}>{name}</a></li>
            ))}
          </ul>
        </div>
      );
    }).filter((e) => e !== null);
    if (i.length == 0)
      return null;
    return (<div key={site.abbr}>{i}</div>);
  }).filter((e) => e !== null);
  if (i.length == 0)
    return (<Logo404 logo={distro != ''} str={"Select one " + category + " from the sidebar"}/>)
  else return i;
});

export default React.memo(({ isoinfo }) => {
  const [category, setCategory] = useState("");
  const [distro, setDistro] = useState("");

  const [allCat, allDistro] = useMemo(() => {
    const allCat = [];
    const allDistro = new Map();
    isoinfo.map(({ info }) => {info.map(({ category, distro }) => {
      if (!allCat.includes(category)) {
        allCat.push(category); // used for display
      }
      if (!allDistro.has(distro)) {
        allDistro.set(distro, category); // used for display
      }
    })});
    return [allCat, allDistro];
  }, [isoinfo]);

  const location = useLocation();
  useEffect(() => {
    const pathnames = location.pathname.split("/") // "" "os" "Ubuntu"
    if (pathnames[1] == "")
      setCategory("os");
    else setCategory(pathnames[1]);
    if (pathnames.length < 3)
      setDistro("");
    else setDistro(pathnames[2]);
  }, [location, isoinfo]);

  return (
    <div className="iso">
      <div className="category">
        {allCat.map((c, idx) => (
          <Link to={`/${c.replace(/\s/g, '')}`} key={idx + c} className={c.replace(/\s/g, '') == category ? "active" : ""}>
            <h2>{c}</h2>
          </Link>
        ))}
      </div>
      <div className="distro-urls-container">
        <div className="distro">
          {[...allDistro].sort((a, b) => a[0].localeCompare(b[0])).map(([d, c], idx) => {
            const nc = c.replace(/\s/g, '');
            const nd = d.replace(/\s/g, '');
            if (category == nc)
              return (
                <Link to={`/${nc}/${nd}`} key={idx + nd} className={nd == distro ? "active" : ""}>
                  <h3>{d}</h3>
                </Link>
             )
          })}
        </div>
        <div className="urls">
          <Urls isoinfo={isoinfo} category={category} distro={distro} />
        </div>
      </div>
    </div>
  );
});

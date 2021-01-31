import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from './Icon';

export default React.memo(({ isoinfo }) => {
  const [category, setCategory] = useState('os');
  const [distro, setDistro] = useState('Ubuntu');

  const [allCat, allDistro] = useMemo(() => {
    const allCat = [];
    const allDistro = new Map();
    isoinfo.map(({ distro, category }) => {
      if (!allCat.includes(category)) {
        allCat.push(category); // used for display
      }
      if (!allDistro.has(distro)) {
        allDistro.set(distro, category); // used for display
      }
    });
    return [allCat, allDistro];
  }, [isoinfo]);

  const location = useLocation();
  useEffect(() => {
    const pathnames = location.pathname.split("/")
    if (pathnames[1] === "") // "" "os" "Ubuntu"
      return;
    setCategory(pathnames[1]);
    if (pathnames.length < 3)
      return;
    setDistro(pathnames[2]);
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
      <div className="distro">
        {[...allDistro].map(([d, c], idx) => {
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
      <ul className="urls">
        {isoinfo.map((info, idx) => {
          if(info.category.replace(/\s/g, '') != category || info.distro.replace(/\s/g, '') != distro)
            return null;
          return info.urls.map(({ name, url }) => (
            <li key={idx + name}><a href={url}>{name}</a></li>
          ));
        })}
      </ul>
    </div>
  );
});

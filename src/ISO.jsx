import React, { useEffect, useState, useMemo, useCallback } from "react";
import Icon from './Icon';

export default React.memo(({ isoinfo }) => {
  const [category, setCategory] = useState('os');
  const [distro, setDistro] = useState('Ubuntu');

  const [allCat, allDistro] = useMemo(() => {
    const allCat = [];
    const allDistro = new Map();
    isoinfo.map(({ distro, category }) => {
      if (!allCat.includes(category)) {
        allCat.push(category);
      }
      if (!allDistro.has(distro)) {
        allDistro.set(distro, category);
      }
    });
    return [allCat, allDistro];
  }, [isoinfo]);

  return (
    <div className="iso">
      <div className="category">
        {allCat.map((c) => (
          <h2 className={c == category ? "active" : ""} onClick={() => setCategory(c)} key={c}>{c}</h2>
        ))}
      </div>
      <div className="distro">
        {[...allDistro].map(([d, c]) => {
          if (category == c)
           return (<h3 className={d == distro ? "active" : ""} onClick={() => setDistro(d)} key={d}>{d}</h3>)
        })}
      </div>
      <ul className="urls">
        {isoinfo.map((info) => {
          if(info.category != category || info.distro != distro)
            return;
          return info.urls.map(({ name, url }) => (
            <li><a href={url} key={name}>{name}</a></li>
          ));
        })}
      </ul>
    </div>
  );
});

import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Logo404 } from './Icon';
import { Info, Site } from "../schema";
import { Page404 } from "./404";

type IsoInfo = { site: Site, info: Info[] }[];

const Urls = React.memo(({ isoinfo, category, distro }: { isoinfo: IsoInfo, category: string, distro: string }) => {
  const i = isoinfo.map(({ site, info }) => {
    const i = info
      .filter(i => i.category.replace(/\s/g, '') === category && i.distro.replace(/\s/g, '') === distro)
      .map(i => <div key={site.abbr}>
        <h3>{site.abbr}</h3>
        <ul>
          {i.urls.map(({ name, url }, idx) =>
            <li key={site.abbr + name + idx}><a href={url}>{name}</a></li>)}
        </ul>
      </div>);
    return i.length === 0 ? null : <div key={site.abbr}>{i}</div>;
  }).filter(e => e !== null);
  return i.length === 0
    ? <Logo404 logo={distro != ''} str={"Select one " + category + " from the sidebar"} />
    : <>{i}</>;
});

export default React.memo(({ isoinfo }: { isoinfo: IsoInfo }) => {
  const params = useParams() as { category?: "os" | "app" | "font", distro?: string };
  const category = params.category ?? "os", distro = params.distro ?? "";

  const [allCat, allDistro] = useMemo(() => {
    const allCat = new Set(isoinfo.flatMap(x => x.info.map(y => y.category)));
    // If duplicated keys found in the array given to `Object.fromEntries`, 
    // the values of latter ones will override former ones, 
    // so use `reverse` to use the first value from the result of `flatMap`.
    const allDistro: { [_: string]: string } = Object.fromEntries(isoinfo
      .flatMap(x => x.info.map(({ category, distro }) => [distro, category]))
      .reverse());
    return [allCat, allDistro];
  }, [isoinfo]);

  return allCat.has(category) ? (
    <div className="iso">
      <div className="category">
        {Array.from(allCat).map((c, idx) => (
          <Link to={`/${c.replace(/\s/g, '')}`} key={idx + c} className={c.replace(/\s/g, '') == category ? "active" : ""}>
            <h2>{c}</h2>
          </Link>
        ))}
      </div>
      <div className="distro-urls-container">
        <div className="distro">
          {Object.entries(allDistro)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .filter(([_, c]) => c.replace(/\s/g, '') === category)
            .map(([d, c], idx) => {
              const nc = c.replace(/\s/g, '');
              const nd = d.replace(/\s/g, '');
              return <Link to={`/${nc}/${nd}`} key={idx + nd} className={nd == distro ? "active" : ""}>
                <h3>{d}</h3>
              </Link>;
            })}
        </div>
        <div className="urls">
          <Urls isoinfo={isoinfo} category={category} distro={distro} />
        </div>
      </div>
    </div>
  ) : <Page404 />;
});

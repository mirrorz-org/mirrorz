import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Logo404 } from './Icon';
import { Info, Site } from "../schema";

type IsoInfo = { site: Site, info: Info[] }[];

const Urls = React.memo(({ isoinfo, category, distro }: { isoinfo: IsoInfo, category: string, distro: string }) => {
  const i = isoinfo.map(({ site, info }) => {
    const i = info.map((i) => {
      if (i.category.replace(/\s/g, '') != category || i.distro.replace(/\s/g, '') != distro)
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
    return (<Logo404 logo={distro != ''} str={"Select one " + category + " from the sidebar"} />)
  else return <>{i}</>;
});

export default React.memo(({ isoinfo }: { isoinfo: IsoInfo }) => {
  const params = useParams() as { category?: "os" | "app" | "font", distro?: string };
  const category = params.category ?? "os", distro = params.distro ?? "";

  const [allCat, allDistro] = useMemo(() => {
    const allCat: string[] = [];
    const allDistro: { [_: string]: string } = {};
    isoinfo.map(({ info }) => {
      info.map(({ category, distro }) => {
        if (!allCat.includes(category)) {
          allCat.push(category); // used for display
        }
        if (!(distro in allDistro)) {
          allDistro[distro] = category; // used for display
        }
      })
    });
    return [allCat, allDistro];
  }, [isoinfo]);

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
          {Object.entries(allDistro).sort((a, b) => a[0].localeCompare(b[0])).map(([d, c], idx) => {
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

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Icon from './Icon';

const Summary = React.memo(({ parsed }) => {
  const mapper = new Map();
  parsed.map(({status}) => {
    [...status].map((s) => {
      if(!mapper.has(s)) mapper.set(s, 0);
      mapper.set(s, mapper.get(s) + 1);
    })
  });
  return (
    <h2 className="summary">
      {mapper.has("S") && (
        <span className="success">
          {mapper.get("S")}
          <Icon>done</Icon>
        </span>
      )}
      {mapper.has("Y") && (
        <span className="syncing">
          {mapper.get("Y")}
          <Icon>sync</Icon>
        </span>
      )}
      {mapper.has("F") && (
        <span className="failed">
          {mapper.get("F")}
          <Icon>error</Icon>
        </span>
      )}
      {mapper.has("P") && (
        <span className="paused">
          {mapper.get("P")}
          <Icon>pause</Icon>
        </span>
      )}
      {mapper.has("U") && (
        <span className="unknown">
          {mapper.get("U")}
          <Icon>info</Icon>
        </span>
      )}
    </h2>
  )
})

export default React.memo(({ site }) => {
  const [curr, setCurr] = useState("BFSU");

  return (
    <div className="site">
      <div className="site-abbr">
        {site.map(({ site, parsed }) => (
          <div className={"group-header" + (site.abbr == curr ? " active" : "")} key={site.abbr} onClick={() => setCurr(site.abbr)}>
            <h2 className="heading">
              {site.abbr}
            </h2>
            <div>
              <Summary parsed={parsed}/>
            </div>
          </div>
        ))}
      </div>
      <div className="site-content">
        {site.map(({ site, parsed }) => {
          if (site.abbr != curr) 
            return;
          return parsed.map(({ cname, status }) => (
          <div className="group-header" key={cname}>
            <h2 className="heading">
              {cname}
            </h2>
            <div>
              <Summary parsed={[{ status }]}/>
            </div>
          </div>
        ))})}
      </div>
    </div>
  );
});

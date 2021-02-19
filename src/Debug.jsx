import React from "react";

export default React.memo(({ mirrorz }) => (
  <div>
    {mirrorz.map((z) => (
      <div key={z.site.abbr}>
        <a href={"data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(z))} download={z.site.abbr+".json"}>
          {z.site.abbr}
        </a>
      </div>
    ))}
  </div>
));

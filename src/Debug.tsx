import React from "react";
import { Mirrorz } from "./schema"

export default React.memo(({ mirrorz }: { mirrorz: Mirrorz[] }) => (
  <div>
    {mirrorz.sort((a, b) => a.site.abbr.localeCompare(b.site.abbr)).map((z) => (
      <div key={z.site.abbr}>
        <a href={"data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(z))} download={z.site.abbr + ".json"}>
          {z.site.abbr}
        </a>
      </div>
    ))}
  </div>
));

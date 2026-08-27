import React from "react";
import { useTranslation } from "react-i18next";
import { Mirrorz } from "../schema";
import Icon from "./Icon";
import { RedirectBadge } from "./RedirectBadge";

export default React.memo(({ mirrorz }: { mirrorz: Mirrorz[] }) => {
  const { t } = useTranslation();
  return (
    <div className="debug">
      <p className="debug-prompt">{t("debug_prompt")}</p>
      <div className="debug-grid">
        {mirrorz
          .sort((a, b) => a.site.abbr.localeCompare(b.site.abbr))
          .map((z) => (
            <a
              key={z.site.abbr}
              className="debug-item"
              href={
                "data:text/json;charset=utf-8," +
                encodeURIComponent(JSON.stringify(z))
              }
              download={z.site.abbr + ".json"}
            >
              <Icon aria-hidden="true">file_download</Icon>
              {z.site.abbr}
              <RedirectBadge abbr={z.site.abbr} />
            </a>
          ))}
      </div>
    </div>
  );
});

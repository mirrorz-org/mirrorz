import React, { createContext, useContext } from "react";
import { useTranslation } from "react-i18next";
import Icon from "./Icon";

export const RedirectSitesContext = createContext<Set<string>>(new Set());

export const RedirectBadge = React.memo(({ abbr }: { abbr: string }) => {
  const sites = useContext(RedirectSitesContext);
  const { t } = useTranslation();

  if (!sites.has(abbr)) return null;

  const label = t("redirect_badge");
  return (
    <span className="redirect-badge" title={label} aria-label={label}>
      <Icon aria-hidden="true">alt_route</Icon>
      302
    </span>
  );
});

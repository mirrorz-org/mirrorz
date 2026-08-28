import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Icon, { Logo404 } from "./Icon";

export const Page404 = React.memo(() => {
  const { t, i18n } = useTranslation();
  return (
    <div className="page-404">
      <Logo404 logo={true} str={t("404_prompt")} />
      <div className="actions-404">
        <Link className="button-404 primary" to="/">
          <Icon aria-hidden="true">home</Icon>
          {t("404_home")}
        </Link>
        <Link className="button-404" to="/list">
          <Icon aria-hidden="true">list_alt</Icon>
          {t("404_list")}
        </Link>
      </div>
    </div>
  );
});

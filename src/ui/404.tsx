import React from "react";
import { useTranslation } from 'react-i18next';
import { Logo404 } from "./Icon";

export const Page404 = React.memo(() => {
  const { t, i18n } = useTranslation();
  return (<Logo404 logo={true} str={t("404_prompt")} />);
});

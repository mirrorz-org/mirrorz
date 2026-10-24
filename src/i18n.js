import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import resources from "./i18n/resources";

let language = navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
try {
  const saved = localStorage.getItem("mirrorz-language");
  if (saved === "zh" || saved === "en") language = saved;
} catch (_) {}
document.documentElement.lang = language;

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: language,
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;

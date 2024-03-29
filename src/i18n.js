import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import config from "./config/config.json";
import resources from "./i18n/resources";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: config.language ?? "en", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;

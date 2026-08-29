const i18n = require("i18next");
const resources = require("./resources");
const config = require("./config.json");

const supportedLanguages = ["en", "zh"];
let language = config.language === "zh" ? "zh" : "en";
if (typeof window !== "undefined") {
  try {
    const savedLanguage = localStorage.getItem("mirrorz-language");
    if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
      language = savedLanguage;
    }
  } catch (_) {}
}

if (typeof document !== "undefined") document.documentElement.lang = language;

i18n
  .init({
    resources,
    lng: language,
    interpolation: {
      escapeValue: false // no user input hence "safe". Use with care
      // react part: react already safes from xss
      // pug part: pug already safes from xss
      // .posthtmlrc.js part: posthtmlrc already safes from xss
    }
  });

module.exports = i18n;

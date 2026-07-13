const i18n = require("i18next");
const resources = require("./resources");
const config = require("./config.json");

i18n
  .init({
    resources,
    lng: config.language ?? "en",
    interpolation: {
      escapeValue: false // no user input hence "safe". Use with care
      // react part: react already safes from xss
      // pug part: pug already safes from xss
      // .posthtmlrc.js part: posthtmlrc already safes from xss
    }
  });

module.exports = i18n;

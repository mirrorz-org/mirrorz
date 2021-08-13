const config = require("./src/config/config.json");
const i18n = require("./src/i18n/");

const meta = config.meta ?? {};
meta["og:url"] = config.url;
meta["og:title"] = config.display;
meta["og:site_name"] = config.display;
meta["og:image"] = config.url + "/static/img/mirrorz.svg";
meta["og:type"] = "website";

module.exports = {
  "plugins": {
    "posthtml-expressions": {
      "locals": {
        "title": config.display,
        "javascript": i18n.t("index.javascript"),
        "legacy_page_prompt_pre": i18n.t("index.legacy_page_prompt_pre"),
        "legacy_page_prompt_post": i18n.t("index.legacy_page_prompt_post"),
        "legacy_page": i18n.t("index.legacy_page"),
        "loading": i18n.t("index.loading"),
        "meta": meta,
      }
    }
  }
}

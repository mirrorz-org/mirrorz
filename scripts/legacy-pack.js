// pack legacy json into one file
// adapted from mirrorz-legacy/generator.js
config = require("../src/config/config.json")

let sites = [];

config.mirrors_legacy.forEach((abbr) => {
  try {
    sites.push(require(`../static/json/legacy/${abbr}.json`));
  } catch (e) {
    console.error(`Error loading ${abbr}: ${e}`);
  }
});
for (const abbr in config.mirrors) {
  try {
    sites.push(require(`../static/json/legacy/${abbr}.json`));
  } catch (e) {
    console.error(`Error loading ${abbr}: ${e}`);
  }
}

console.log(JSON.stringify(sites))

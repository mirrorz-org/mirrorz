// pack legacy json into one file
// adapted from mirrorz-legacy/generator.js
config = require("../src/config/config.json")

let sites = [];

config.mirrors_legacy.forEach((abbr) => {
  sites.push(require(`../static/json/legacy/${abbr}.json`));
});
for (const abbr in config.mirrors) {
  sites.push(require(`../static/json/legacy/${abbr}.json`));
}

console.log(JSON.stringify(sites))

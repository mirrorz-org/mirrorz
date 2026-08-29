// pack legacy json into one file
// adapted from mirrorz-legacy/generator.js
const config = require("../src/config/config.json");

let sites = [];

for (const abbr of [...(config.legacy_pack ?? []), ...config.mirrors]) {
  try {
    sites.push(require(`../static/json/legacy/${abbr}.json`));
  } catch (e) {
    console.error(`Error loading ${abbr}: ${e}`);
  }
}

console.log(JSON.stringify(sites));

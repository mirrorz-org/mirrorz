const date = require("./date");
module.exports = async function (repoUrl) {
  return await date(repoUrl + "/sync_timestamp");
};

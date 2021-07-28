module.exports = async function (repoUrl) {
  text = await (await fetch(repoUrl + "/state")).text();
  return Math.round((new Date(text.match(/date=(.*)$/)[1]))/1000);
};

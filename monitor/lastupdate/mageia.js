module.exports = async function (repoUrl) {
  text = await (await fetch(repoUrl + "/mageia_timestamp")).text();
  return parseInt(text.split('\n')[0]);
};

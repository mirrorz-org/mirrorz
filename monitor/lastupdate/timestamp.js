module.exports = async function (timestampUrl) {
  return parseInt(await (await fetch(timestampUrl)).text());
};

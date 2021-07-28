module.exports = async function (dateUrl) {
  return Math.round((new Date(await (await fetch(dateUrl)).text()))/1000);
};

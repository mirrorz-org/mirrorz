const cname = require("./utils").cname;


module.exports = async function (homepageURL, yukiURL) {
  homepageHTML = await (await fetch(homepageURL)).text();
  yukiMeta = await (await fetch(yukiURL)).json();

  const parser = new DOMParser();
  const doc = parser.parseFromString(homepageHTML, 'text/html');
  const items = Array.from(doc.querySelectorAll(".filelist tbody tr"));

  
}
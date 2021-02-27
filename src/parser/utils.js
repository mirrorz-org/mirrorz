exports.cname = async function() {
  const cname = await (await fetch("https://mirrorz.org/static/json/cname.json")).json();
  return (name) => { return (name in cname) ? cname[name] : name; };
};

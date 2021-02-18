export const cname = async function() {
  const cname = await (await fetch("/static/json/cname.json")).json();
  return (name) => { return (name in cname) ? cname[name] : name; };
};

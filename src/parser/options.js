import { cname } from "./utils";

export default async function (optionsUrl, mirrors) {
  const name_func = await cname();
  const options = await (await fetch(optionsUrl)).json();

  options.options.unlisted_mirrors.forEach((u) => {
    let exist = false;
    let status = "U";
    if ("link_to" in u) {
      mirrors.forEach((m) => {
        if (m.options_name == u.link_to) {
          exist = true;
          status = m.status;
        }
      });
    } else
      exist = true;

    if (exist) {
      const mirror = {
        cname: name_func(u.name),
        url: "url" in u ? u.url : "/" + u.name,
        status,
      }
      if ("upstream" in u)
        mirror["upstream"] = u.upstream;
      mirrors.push(mirror);
    }
  });

  for (const d of options.options.mirror_desc)
    for (const m of mirrors)
      if (m.options_name == d.name)
        m.desc = d.desc;

  for (const h of options.helps)
    for (const m of mirrors)
      if (m.options_name == h.mirrorid)
        m.help = h.url;

  for (const f of options.options.force_redirect_help_mirrors)
    for (const m of mirrors)
      if (m.options_name == f)
        m.url = m.help;

  for (const n of options.options.new_mirrors)
    for (const m of mirrors)
      if (m.options_name == n)
        m.status += "N";

  return mirrors;
};

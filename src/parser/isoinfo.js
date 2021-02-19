import { cname } from "./utils";

export default async function (isoinfoUrl) {
  const name_func = await cname();
  const isoinfo = await (await fetch(isoinfoUrl)).json();

  return isoinfo.map((item) => {
    return {
      distro: name_func(item.distro),
      category: item.category,
      urls: item.urls,
    };
  });
};

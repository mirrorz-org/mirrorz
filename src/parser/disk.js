const human = function(size) {
  const scale = ["KiB", "MiB", "GiB", "TiB"];
  let i = 0;
  while (size > 1024) {
    size /= 1024;
    i += 1;
  }
  return size.toFixed(2) + scale[i];
}

module.exports = async function (diskUrl) {
  const disk = await (await fetch(diskUrl)).json();
  return human(disk.used_kb) + "/" + human(disk.total_kb);
};

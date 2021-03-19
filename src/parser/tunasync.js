const cname = require("./utils").cname;

const MAP = {
  success: "S",
  syncing: "Y",
  unknown: "U",
  failed: "F",
  fail: "F",
  paused: "P",
};

const statusConverter = function(item) {
  let s = MAP[item.status] ?? "U";

  if ((s == "S" || s == "P") && "last_update_ts" in item && item["last_update_ts"] > 0)
      s += item["last_update_ts"].toString(); // successful sync end
  else if (s == "Y" && "last_started_ts" in item && item["last_started_ts"] > 0) {
      s += item["last_started_ts"].toString(); // sync start time stamp
      if ("last_update_ts" in item && item["last_update_ts"] > 0)
          s += "O" + item["last_update_ts"].toString(); // last successful sync is still important
  }
  else if (s == "F" && "last_ended_ts" in item && item["last_ended_ts"] > 0) {
      s += item["last_ended_ts"].toString(); // last attemped
      if ("last_update_ts" in item && item["last_update_ts"] > 0)
          s += "O" + item["last_update_ts"].toString(); // last successful sync is still important
  }

  if ("next_schedule_ts" in item && item["next_schedule_ts"] > 0)
      s += "X" + item["next_schedule_ts"].toString();

  return s;
};

module.exports = async function (tunasyncUrl) {
  const name_func = await cname();
  const tunasync = await (await fetch(tunasyncUrl)).json();

  return tunasync.map((item) => {
    if (item.name == "")
      return null;
    const mirror = {
      cname: name_func(item.name),
      options_name: item.name, // used by options, not standard mirrorz protocol!
      url: "url" in item ? item.url : "/" + item.name,
      status: statusConverter(item),
    }
    if ("upstream" in item)
      mirror["upstream"] = item.upstream;
    if ("size" in item)
      mirror["size"] = item.size;
    return mirror;
  }).filter((e) => e !== null);
};

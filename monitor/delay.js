const {InfluxDB} = require('@influxdata/influxdb-client')
const {url, token, org, bucket} = require('./env')

const human = (delta) => {
  if (delta == 0) {
    return "0";
  }
  const plural = (numf, str, prefix, suffix) => {
    const num = Math.round(numf);
    return prefix +
      num.toString() + " " +
      (num == 1 ? str : str + "s") +
      suffix;
  }
  const agoF = (num, str) => plural(num, str, "", " ago");
  const inF = (num, str) => plural(num, str, "in ", "");

  const scale = [60, 60, 24, 30, 365, 1e15];
  const scaleStr = ["second", "minute", "hour", "day", "month", "year"];
  let offset = (delta > 0 ? delta : -delta);
  for (let i = 0; i != scale.length; ++i) {
    if (offset < scale[i])
      return delta < 0 ? agoF(offset, scaleStr[i]) : inF(offset, scaleStr[i]);
    offset /= scale[i];
  }
}

if (process.argv.length < 5) {
  console.log("Usage: nodejs delay.js mirrorz.site.abbr from to")
}
const mirror = process.argv[2]
const from = process.argv[3]
const to = process.argv[4]

const queryApi = new InfluxDB({url, token}).getQueryApi(org)
const fluxQuery =`
  from(bucket:"${bucket}")
    |> range(start: -30m)
    |> filter(fn: (r) => r._measurement == "repo" and r.mirror == "${mirror}")
    |> map(fn: (r) => ({_value:r._value,name:r.name,_time:r._time,path:r.url}))
    |> tail(n:1)
`

console.log(`From: ${from}`)
console.log(`To: ${to}`)
console.log(`Subject: MirrorZ report for ${mirror}`)

const delays = []
queryApi.queryRows(fluxQuery, {
  next(row, tableMeta) {
    const o = tableMeta.toObject(row)
    log = `${o.name}:\t\t${human(o._value)}\t\tcollected ${human(Math.round((new Date(o._time) - new Date())/1000))}`
    if (o._value == 0) {
      delays.push([o._value , "--- " + log])
    }
    if (o._value < -24*60*60 && o._value > -24*60*60*3)
      delays.push([o._value , "*** " + log])
    if (o._value < -24*60*60*3)
      delays.push([o._value , "!!! " + log])
  },
  error(error) {
    console.error(error)
    console.log('\nFinished ERROR')
  },
  complete() {
    delays.sort((a, b) => a[0] - b[0])
    for (d of delays)
      console.log(d[1])
    //console.log('\nFinished SUCCESS')
  },
})


const {InfluxDB} = require('@influxdata/influxdb-client')
const {url, token, org, bucket} = require('./env')

if (process.argv.length < 3) {
  console.log("Usage: nodejs delay.js mirrorz.site.abbr")
}
const mirror = process.argv[2]

const queryApi = new InfluxDB({url, token}).getQueryApi(org)
const fluxQuery =`
  from(bucket:"${bucket}")
    |> range(start: -30m)
    |> filter(fn: (r) => r._measurement == "repo" and r.mirror == "${mirror}")
    |> map(fn: (r) => ({_value:r._value,name:r.name,_time:r._time,path:r.url}))
    |> limit(n:1)
`

console.log(`MirrorZ report for ${mirror}`)
const delays = []
queryApi.queryRows(fluxQuery, {
  next(row, tableMeta) {
    const o = tableMeta.toObject(row)
    log = `${o.name}:\t\t${o._value}\t\tcollected at ${o._time}`
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


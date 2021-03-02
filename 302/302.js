addEventListener("fetch", event => {
    event.respondWith(handler(event.request));
});

const query = `
  repo = from(bucket:"mirrorz")
    |> range(start: -10m)
    |> filter(fn: (r) => r._measurement == "repo" and r.name == "reponame")
    |> map(fn: (r) => ({_value:r._value,mirror:r.mirror,_time:r._time,path:r.url}))
    |> limit(n:1)

  site = from(bucket:"mirrorz")
    |> range(start: -10m)
    |> filter(fn: (r) => r._measurement == "site")
    |> map(fn: (r) => ({mirror:r.mirror,url:r.url}))
    |> limit(n:1)

  join(tables: {repo: repo, site: site}, on: ["mirror"])
    |> map(fn: (r) => ({_value:r._value,mirror:r.mirror,url:r.url+r.path,_time:r._time}))
`

function is_debug(request) {
    const params = {};
    const req_url = new URL(request.url);
    const queryString = req_url.search.slice(1).split('&');
    queryString.forEach(item => {
        const kv = item.split('=')
        if (kv[0]) {
            if (kv[0] in params) {
                params[kv[0]].push(kv[1] || true)
            } else {
                params[kv[0]] = [kv[1] || true]
            }
        }
    });
    return ('debug' in params);
}

function newest(csv) {
    let m = -Infinity;
    let url = null;

    for (const line of csv.split('\r\n')) {
        const arr = line.split(',');
        if (arr.length < 7)
            continue
        if (arr[1] !== "_result")
            continue
        try {
            const v = parseInt(arr[4]);
            // 0 is a special value, namely unknown!
            // valid range:  v < 0
            if (v == 0)
                continue;
            if (v > m) {
                m = v;
                url = arr[6];
            }
        } catch (e) {}
    }
    return url;
}

function decide(csv) {
    return newest(csv);
}

async function handler(request) {
    try {
        let pathname = (new URL(request.url)).pathname;
        let pathname_arr = pathname.split('/');

        // Redirect to homepage
        if (pathname_arr[1].length === 0)
            return Response.redirect('https://mirrorz.org', 302);

        // Query influxdb 2.x
        response = await fetch('http://localhost:8086/api/v2/query?org=your-org', {
            headers: {
                'Authorization': 'Token YourToken',
                'Content-Type': 'application/vnd.flux',
            },
            method: "POST",
            body: query.replace('reponame', pathname_arr[1]),
        });

        const csv = await response.text();
        if (is_debug(request))
            return new Response(csv);

        const url = decide(csv);

        if (url === null)
            return new Response(`Not Found`, {status: 404});

        // Append the remaining path
        let remain_path = pathname.substr(1+pathname_arr[1].length);
        // Dark magic for some sites treating '/archlinux' as file, not directory
        if (remain_path.length === 0 && !pathname.endsWith('/'))
            remain_path = '/'
        const redir_url = url + remain_path;

        return Response.redirect(redir_url, 302);
    } catch (err) {
        return new Response(`${err}`, { status: 500 })
    }
}


const pug = require('pug')
const fs = require('fs')
const fetch = require('node-fetch')

// 这里 isolist 与 isolist_name 形成对应关系 假设 isolist[0] 是 Arch Linux 发行版内容 isolist_name[0] 就是 Arch Linux
let isolist = []
let isolist_name = []
let isolist_category = []

let mlist = []
let mlist_name = []
let sites = []
// 写 头 这里直接借了编译好的 css svg
let head = fs.readFileSync(__dirname + '/template/head.pug.tempest')
fs.readdirSync(__dirname + '/../dist/').map(f=>{
    if(f.indexOf('.map') == -1){
        if(f.indexOf('.css') > -1){
            head += `  link(rel='stylesheet', href='/${f}')\n`
        }else if(f.indexOf('.svg') > -1){
            head += `  link(rel='icon', type='image/svg+xml', href='${f}')\n`
        }
    }
})
fs.writeFileSync(__dirname + '/template/head.pug',head)
handle()
async function handle(){
    
    // 这里可能会下载失败，可能要再改改
    await asyncForEach(require('../src/config/mirrors'),async url=>{
        try {
            console.log('downloading',url)
            let data = await fetch(url)
            sites.push(await data.json())
        } catch (error) {
            // 这里没有用 .error 怕整个ci炸
            console.log('download error',url)
        }
    })
    sites.forEach((s,sid)=>{
        // 补全 / （后面发现不用补
        let base_url = s.site.url// + (s.site.url.substr(-1,1) !== '/' ? '/' : '')
        // 安排 /iso
        s.info.forEach((info,id)=>{
            let i = isolist_name.indexOf(info.distro)
            if(isolist_name.indexOf(info.distro) == -1){
                i = isolist_name.length
                isolist_name.push(info.distro)
                isolist_category.push(info.category)
            }
            if(isolist[i] === undefined)
                isolist[i] = []
            if(isolist[i][sid] === undefined)
                isolist[i].push({
                    abbr: s.site.abbr,
                    data: info.urls.map(u=>{
                        return {
                            url: base_url + u.url,
                            name: u.name
                        }
                    })
                })
        })
        //安排 /list
        s.mirrors.forEach(m=>{
            let i = mlist_name.indexOf(m.cname)
            if(mlist_name.indexOf(m.cname) == -1){
                i = mlist_name.length
                mlist_name.push(m.cname)
                mlist[i] = []
            }
            m.url = base_url + m.url
            if(m.help)
                m.help = m.help !== '' ? (m.help.indexOf('http') > -1 ? m.help : (base_url + m.help)) : false
            m.site = {
                abbr: s.site.abbr,
                name: s.site.name,
                note: s.site.note
            }
            if(m.desc == '')
                m.desc = '无可奉告'
            mlist[i].push(m)
        })
    })
    isolist.forEach((data,id)=>{
        data = data.sort((a, b) => a.abbr.localeCompare(b.abbr))
        let category = isolist_category[id]
        let name = isolist_name[id]
        let html = pug.compileFile('./legacy/template/iso_content.pug')({
            sidebar: isolist_name.map(n=>{
                let tid = isolist_name.indexOf(n)
                if(category != isolist_category[tid])
                    return false
                return {
                    url: `/_/${isolist_category[tid]}/${n.replace(/ /ig,'')}`,
                    name: n.trim(),
                    active: n == name
                }
            }).filter(x=>{return x}).sort((a, b) => a.name.localeCompare(b.name)),
            navbar_active: isolist_category[id],
            distro_name: name,
            data: data
        })
        wf(`../dist/_/${isolist_category[id]}/${name.replace(/ /ig,'')}/index.html`,html)
    })
    // 生成 /list
    wf(`../dist/_/list/index.html`,pug.compileFile('./legacy/template/list_index.pug')({
        data: mlist_name.map(m=>{
            return {
                name: m.trim(),
                url: `/_/list/${m.replace(/ /ig,'')}`
            }
        }).sort((a, b) => a.name.localeCompare(b.name))
    }));
    // 上面的 ; 是一定要的 不然会报错（（（
    // 生成 /os /app /font /
    ['os','app','font'].forEach(category=>{
        let html = pug.compileFile('./legacy/template/iso_index.pug')({
            sidebar: isolist_name.map(n=>{
                let tid = isolist_name.indexOf(n)
                if(category != isolist_category[tid])
                    return false
                return {
                    url: `/_/${isolist_category[tid]}/${n.replace(/ /ig,'')}`,
                    name: n.trim()
                }
            }).filter(x=>{return x}).sort((a, b) => a.name.localeCompare(b.name)),
            navbar_active: category
        })
        wf(`../dist/_/${category}/index.html`,html)
        if(category == 'os')
            wf(`../dist/_/index.html`,html)
    })
    // /list/*/
    mlist.forEach((data,id)=>{
        let name = mlist_name[id]
        let html = pug.compileFile('./legacy/template/list_content.pug')({
            name: name,
            data: data.sort((a, b) => a.site.abbr.localeCompare(b.site.abbr))
        })
        wf(`../dist/_/list/${name.replace(/ /ig,'')}/index.html`,html)
    })
    sites.forEach((data,id)=>{
        let html = pug.compileFile('./legacy/template/site.pug')({
            data: data,
            sidebar: sites.map(n=>{
                return {
                    url: `/_/site/${n.site.abbr}`,
                    abbr: n.site.abbr,
                    logo: n.site.logo,
                    active: n.site.abbr == data.site.abbr
                }
            }).sort((a, b) => a.abbr.localeCompare(b.abbr)),
        })
        // 目前 BFSU 是排最前的 所以就钦定你是 /site 首页了
        if(data.site.abbr == 'BFSU'){
            wf(`../dist/_/site/index.html`,html)
        }
        wf(`../dist/_/site/${data.site.abbr}/index.html`,html)
    })
    wf(`../dist/_/about/index.html`,pug.compileFile('./legacy/template/about.pug')({
        sites: sites.sort((a, b) => a.site.abbr.localeCompare(b.site.abbr))
    }))
}
// 随便写的垃圾函数 其实应该 import 个 path 处理 subpath
function wf(path,data){
    console.log('w',path)
    let subpath = path.split('/')
    delete subpath[subpath.length -1]
    subpath = __dirname + '/' + subpath.join('/')
    if(!fs.existsSync(subpath))
        fs.mkdirSync(subpath,{
            recursive: true
        })
    fs.writeFileSync(__dirname + '/' + path,data)
}
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}
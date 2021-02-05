const pug = require('pug')
const fs = require('fs')
const fetch = require('node-fetch')

// 这里 isolist 与 isolist_name 形成对应关系 假设 isolist[0] 是 Arch Linux 发行版内容 isolist_name[0] 就是 Arch Linux
let isolist = []
let isolist_name = []
let isolist_category = []

let mlist = []
let mlist_name = []
let site_list = []
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
    let dd = []
    // 这里可能会下载失败，可能要再改改
    await asyncForEach(require('../src/config/mirrors'),async url=>{
        try {
            console.log('downloading',url)
            let data = await fetch(url)
            dd.push(await data.json())
        } catch (error) {
            // 这里没有用 .error 怕整个ci炸
            console.log('download error',url)
        }
    })
    dd.forEach(s=>{
        // 补全 / （后面发现不用补
        let base_url = s.site.url// + (s.site.url.substr(-1,1) !== '/' ? '/' : '')
        /* 安排 /iso */
        s.info.forEach((info,id)=>{
            let i = isolist_name.indexOf(info.distro)
            if(isolist_name.indexOf(info.distro) == -1){
                i = isolist_name.length
                isolist_name.push(info.distro)
                isolist_category.push(info.category)
                isolist[i] = []
            }
            isolist[i] = isolist[i].concat((info.urls.map(u=>{
                return {
                    url: base_url + u.url,
                    name: u.name + ` [${s.site.abbr}]`
                }
            })))
        })
        /* 安排 /list */
        s.mirrors.forEach(m=>{
            let i = mlist_name.indexOf(m.cname)
            if(mlist_name.indexOf(m.cname) == -1){
                i = mlist_name.length
                mlist_name.push(m.cname)
                mlist[i] = []
            }
            m.url = base_url + m.url
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
        site_list.push(s)
    })
    isolist.forEach((data,id)=>{
        let category = isolist_category[id]
        let name = isolist_name[id]
        let html = pug.compileFile('./legacy/template/iso.pug')({
            sidebar: isolist_name.map(n=>{
                let tid = isolist_name.indexOf(n)
                if(category != isolist_category[tid])
                    return false
                return {
                    url: `/_/${isolist_category[tid]}/${n.replace(/ /ig,'')}`,
                    name: n.trim(),
                    active: n == name
                }
            }).filter(x=>{return x}),
            navbar_active: isolist_category[id],
            distro_name: name,
            data: data
        })
        wf(`../dist/_/${isolist_category[id]}/${name.replace(/ /ig,'')}/index.html`,html)
        // 下面三个默认为 /os /app /font 的首页。
        if(['Ubuntu','Git','Adobe Source'].indexOf(name) > -1){
            // ubuntu 默认为 / 首页
            if(name == 'Ubuntu'){
                wf(`../dist/_/index.html`,html)
            }
            wf(`../dist/_/${isolist_category[id]}/index.html`,html)
        }
    })
    // 生成 /list
    wf(`../dist/_/list/index.html`,pug.compileFile('./legacy/template/list.pug')({
        data: mlist_name.map(m=>{
            return {
                name: m.trim(),
                url: `/_/list/${m.replace(/ /ig,'')}`
            }
        })
    }))
    // /list/*/
    mlist.forEach((data,id)=>{
        let name = mlist_name[id]
        let html = pug.compileFile('./legacy/template/list_content.pug')({
            name: name,
            data: data
        })
        wf(`../dist/_/list/${name.replace(/ /ig,'')}/index.html`,html)
    })
    site_list.forEach((data,id)=>{
        let html = pug.compileFile('./legacy/template/site.pug')({
            data: data,
            sidebar: site_list.map(n=>{
                return {
                    url: `/_/site/${n.site.abbr}`,
                    abbr: n.site.abbr,
                    logo: n.site.logo,
                    active: n.site.abbr == data.site.abbr
                }
            }),
        })
        if(id == 0){
            wf(`../dist/_/site/index.html`,html)
        }
        wf(`../dist/_/site/${data.site.abbr}/index.html`,html)
    })
    wf(`../dist/_/about/index.html`,pug.compileFile('./legacy/template/about.pug')({
        site_list: site_list
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
    await callback(array[index], index, array);
  }
}
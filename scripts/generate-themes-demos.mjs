// Generates the "Themes" demos: node scripts/generate-themes-demos.mjs public/media/wordpress/themes
// - temas / store: recreations of Appearance › Themes and Add Themes (shared engine in lib/wp-admin-demo.mjs)
// - cambio: the same content shown with Twenty Twenty-Five / Four / Three
// - estilos: Twenty Twenty-Five style variations (real palettes and fonts from its theme.json files)
// - plantillas: wireframes of the basic templates that come with Twenty Twenty-Five
import fs from 'node:fs'; import path from 'node:path';
import { adminScreen, buildDemo } from './lib/wp-admin-demo.mjs';
const OUT = process.argv[2];

/* ------------------------------------------------- admin: Themes screen */

const SHOT = n => `../assets/shots/${n}.jpg`;

const themesMain = `
  <div class="tabs"><span class="tab">Help ▾</span></div>
  <div class="head"><h1>Themes <span class="count" data-z="t-count">3</span></h1><span class="btn2" data-z="t-addbtn">Add Theme</span>
    <span class="search2">Search installed themes…</span></div>
  <div class="grid">
    <div class="th active" data-z="t-active"><img src="${SHOT('twentytwentyfive')}" alt=""><div class="tf"><span><b>Active:</b> Twenty Twenty-Five</span><span class="btn" data-z="t-customize">Customize</span></div></div>
    <div class="th hover" data-z="t-card"><img src="${SHOT('twentytwentyfour')}" alt=""><span class="det" data-z="t-details">Theme Details</span><div class="tf"><span>Twenty Twenty-Four</span><span class="acts"><span class="btn" data-z="t-activate">Activate</span><span class="btn2" data-z="t-preview">Live Preview</span></span></div></div>
    <div class="th"><img src="${SHOT('twentytwentythree')}" alt=""><div class="tf"><span>Twenty Twenty-Three</span></div></div>
    <div class="th add" data-z="t-add"><span class="plus">+</span><span>Add Theme</span></div>
  </div>`;

const storeThemes = [
  ['twentytwentyfive', 'Twenty Twenty-Five', 'activated'],
  ['hello-elementor', 'Hello Elementor', 'install'],
  ['astra', 'Astra', ''],
  ['twentytwentyfour', 'Twenty Twenty-Four', 'installed'],
  ['kadence', 'Kadence', ''],
  ['twentytwentythree', 'Twenty Twenty-Three', ''],
  ['extendable', 'Extendable', ''],
  ['hello-biz', 'Hello Biz', ''],
];
const storeMain = `
  <div class="tabs"><span class="tab">Help ▾</span></div>
  <div class="head"><h1>Add Themes</h1><span class="btn2" data-z="s-upload">Upload Theme</span></div>
  <div class="filter">
    <ul class="flinks" data-z="s-tabs"><li class="cur">Popular</li><li>Latest</li><li>Block Themes</li><li>Favorites</li></ul>
    <span class="fbtn" data-z="s-feature">⚙ Feature Filter</span>
    <span class="search2" data-z="s-search">Search Themes</span>
  </div>
  <div class="grid g4">${storeThemes.map(([slug, name, state]) => `
    <div class="th${state === 'install' ? ' hover' : ''}"${state === 'activated' ? ' data-z="s-installed"' : state === 'install' ? ' data-z="s-card"' : ''}>
      ${state === 'activated' ? '<span class="ok">✓ Installed</span>' : ''}
      <img src="${SHOT(slug)}" alt="">
      ${state === 'install' ? '<span class="det" data-z="s-details">Details &amp; Preview</span>' : ''}
      <div class="tf"><span>${name}</span>${state === 'activated' ? '<span class="acts"><span class="btn dis">Activated</span></span>' : ''}${state === 'install' ? '<span class="acts" data-z="s-install"><span class="btn">Install</span><span class="btn2">Preview</span></span>' : ''}</div>
    </div>`).join('')}
  </div>`;

const ADMIN_CSS = `
.head{display:flex;align-items:center;gap:10px;margin:6px 0 16px}
.head h1{margin:0;display:flex;align-items:center;gap:8px}
.head .count{display:inline-block;padding:2px 8px;border-radius:10px;background:#dcdcde;font-size:13px;color:#50575e}
.search2{margin-left:auto;display:inline-flex;align-items:center;width:230px;height:30px;padding:0 8px;border:1px solid #8c8f94;border-radius:3px;background:#fff;color:#8c8f94;font-size:13px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.grid.g4{grid-template-columns:repeat(4,1fr);gap:18px}
.th{position:relative;background:#fff;border:1px solid #dcdcde;box-shadow:0 1px 1px rgba(0,0,0,.04);overflow:hidden}
.th img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover}
.tf{display:flex;align-items:center;justify-content:space-between;gap:6px;min-height:52px;padding:10px 12px;border-top:1px solid #dcdcde;font-size:14px;font-weight:600;background:#fff}
.g4 .tf{min-height:44px;padding:8px 10px;font-size:13px}
.th.active .tf{background:#1e1e1e;color:#fff;font-weight:400}
.th.active .tf b{font-weight:400;color:#c3c4c7}
.acts{display:flex;gap:5px}
.tf .btn,.tf .btn2{font-size:12px;padding:4px 9px;font-weight:400}
.btn.dis{background:#f0f0f1;color:#a7aaad}
.th.hover img{opacity:.55}
.det{position:absolute;left:0;right:0;margin:0 auto;width:max-content;top:26%;background:rgba(0,0,0,.72);color:#fff;font-size:13px;font-weight:600;padding:9px 14px;border-radius:3px;white-space:nowrap}
.g4 .det{font-size:12px;padding:7px 10px;top:30%}
.th.add{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:rgba(0,0,0,.04);border:2px dashed #c3c4c7;box-shadow:none;color:#50575e;font-size:15px;font-weight:600;aspect-ratio:auto}
.th.add .plus{width:64px;height:64px;border-radius:50%;background:rgba(0,0,0,.08);display:flex;align-items:center;justify-content:center;font-size:42px;font-weight:300}
.ok{position:absolute;left:0;right:0;top:0;z-index:1;background:#edfaef;border-bottom:1px solid #00a32a;color:#008a20;font-size:12px;padding:5px 10px}
.filter{display:flex;align-items:center;gap:16px;background:#fff;border:1px solid #dcdcde;padding:0 12px;height:46px;margin-bottom:16px}
.flinks{list-style:none;display:flex;gap:18px;height:100%}
.flinks li{display:flex;align-items:center;font-size:13px;color:#50575e}
.flinks li.cur{color:#1e1e1e;box-shadow:inset 0 -4px #3858e9;font-weight:500}
.fbtn{font-size:13px;color:#50575e}
`;

/* ------------------------------------------------ standalone demos (app style) */

const FONT_FACES = `
@font-face{font-family:'Manrope';src:url(../assets/fonts/Manrope-VariableFont_wght.woff2) format('woff2');font-weight:200 800}
@font-face{font-family:'Roboto Slab';src:url(../assets/fonts/RobotoSlab-VariableFont_wght.woff2) format('woff2');font-weight:100 900}
@font-face{font-family:'Beiruti';src:url(../assets/fonts/Beiruti-VariableFont_wght.woff2) format('woff2');font-weight:200 900}
@font-face{font-family:'Literata';src:url(../assets/fonts/Literata72pt-Regular.woff2) format('woff2')}
@font-face{font-family:'Fira Sans';src:url(../assets/fonts/FiraSans-Regular.woff2) format('woff2')}
@font-face{font-family:'Cardo';src:url(../assets/fonts/cardo_normal_400.woff2) format('woff2')}
@font-face{font-family:'Inter TT4';src:url(../assets/fonts/Inter-Variable.woff2) format('woff2');font-weight:100 900}
@font-face{font-family:'DM Sans';src:url(../assets/fonts/DMSans-Regular.woff2) format('woff2')}
`;

const APP_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%}
body{overflow:hidden;background:oklch(0.9524 0.0013 286.37);color:oklch(0.2103 0.0059 285.89);display:flex;align-items:center;justify-content:center;padding:6px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased}
:root{--acc:oklch(0.7819 0.1585 72.33);--fg:oklch(0.2103 0.0059 285.89);--muted:oklch(0.5517 0.0138 285.94);--line:oklch(90% 0.004 286.32);--mono:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;--code:'SFMono-Regular',ui-monospace,Menlo,Consolas,monospace}
.card{width:100%;height:100%;background:#fff;border:1px solid var(--line);border-radius:16px;box-shadow:0 2px 4px 0 rgba(0,0,0,.04),0 1px 2px 0 rgba(0,0,0,.06),0 0 1px 0 rgba(0,0,0,.06);padding:16px;display:flex;flex-direction:column;gap:14px;opacity:0;transform:translateY(6px);animation:in .45s cubic-bezier(.22,1,.36,1) .05s forwards}
@keyframes in{to{opacity:1;transform:none}}
.ctl{display:flex;flex-wrap:wrap;gap:6px;flex:none}
.chip{font-family:var(--mono);font-size:12.5px;font-weight:500;line-height:1;padding:7px 12px;border-radius:999px;border:1px solid var(--line);background:#fff;color:var(--fg);cursor:pointer;transition:background .2s,color .2s}
.chip.on{background:var(--fg);border-color:var(--fg);color:#fff}
.browser{position:relative;flex:1;min-height:0;border-radius:10px;overflow:hidden;outline:1px solid var(--line);display:flex;flex-direction:column}
.bbar{flex:none;display:flex;align-items:center;gap:5px;height:26px;padding:0 10px;background:#f3f3f4;border-bottom:1px solid var(--line)}
.bbar i{width:7px;height:7px;border-radius:50%;background:#d4d4d8}
.bbar .u{margin-left:8px;flex:1;max-width:240px;height:16px;border-radius:5px;background:#fff;font-family:var(--mono);font-size:9px;color:var(--muted);display:flex;align-items:center;padding:0 6px}
.cap{flex:none;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;padding:0 4px 2px;min-height:18px;transition:opacity .2s}
.cap.swap{opacity:0}
.cap .n{font-size:14px;font-weight:600;letter-spacing:-.005em}
.cap .t{font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--acc)}
.cap .d{font-size:13px;font-weight:500;color:var(--muted)}
.cap .t{width:auto;min-height:0}
`;

// chips + autoplay; `onSelect(value)` is page specific
const CHIPS_JS = `
const chips=[...document.querySelectorAll('.chip')];
let timer=null;
function pick(c){chips.forEach(x=>x.classList.toggle('on',x===c));onSelect(c.dataset.v);}
chips.forEach(c=>c.addEventListener('click',()=>{clearInterval(timer);pick(c);}));
pick(chips[0]);
timer=setInterval(()=>{const i=chips.findIndex(c=>c.classList.contains('on'));pick(chips[(i+1)%chips.length]);},3200);
`;

const page = (title, css, body, js) => `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title>
<style>${FONT_FACES}${APP_CSS}${css}</style></head>
<body>${body}<script>${js}</script></body></html>
`;

/* cambio: same content, three themes */
const cambio = page('Mismo contenido, otro tema', `
.site{flex:1;min-height:0;overflow:hidden;transition:background .5s,color .5s;background:var(--bg);color:var(--fg2);font-family:var(--body)}
.site *{transition:all .5s cubic-bezier(.22,1,.36,1)}
.sh{display:flex;align-items:center;justify-content:space-between;padding:16px 26px}
.logo{font-family:var(--head);font-size:15px;font-weight:var(--logow)}
.nav{font-size:12px;opacity:.85}
.post{padding:22px 26px 10px;max-width:var(--w);margin:0 auto;text-align:var(--align)}
.meta{font-size:11px;opacity:.65;margin-bottom:8px}
.post h1{font-family:var(--head);font-size:var(--hs);font-weight:var(--hw);line-height:1.1;letter-spacing:var(--ls);margin-bottom:14px}
.img{height:var(--imgh);border-radius:var(--rad);background:var(--imgbg);margin:0 0 14px}
.post p{font-size:13px;line-height:1.6;text-align:left}
.btnx{display:inline-block;margin-top:14px;padding:8px 16px;font-size:12px;border-radius:var(--brad);background:var(--btn);color:var(--btnfg)}
.sf{margin-top:18px;padding:14px 26px;border-top:1px solid var(--line2);font-size:11px;display:flex;justify-content:space-between;opacity:.8}
[data-t=tt5]{--bg:#fff;--fg2:#111;--body:Manrope,sans-serif;--head:Manrope,sans-serif;--logow:600;--hs:40px;--hw:400;--ls:-.02em;--w:560px;--align:left;--imgh:70px;--rad:0;--imgbg:linear-gradient(120deg,#FFEE58,#F6CFF4);--btn:#111;--btnfg:#fff;--brad:999px;--line2:#e5e5e5}
[data-t=tt4]{--bg:#f9f9f9;--fg2:#111;--body:'Inter TT4',sans-serif;--head:Cardo,serif;--logow:400;--hs:40px;--hw:400;--ls:0;--w:520px;--align:center;--imgh:64px;--rad:6px;--imgbg:linear-gradient(120deg,#cfcabe,#c2a990);--btn:#111;--btnfg:#f9f9f9;--brad:6px;--line2:#ddd}
[data-t=tt3]{--bg:#fff;--fg2:#000;--body:system-ui,-apple-system,'Segoe UI',sans-serif;--head:system-ui,-apple-system,'Segoe UI',sans-serif;--logow:700;--hs:34px;--hw:600;--ls:-.01em;--w:600px;--align:left;--imgh:56px;--rad:0;--imgbg:#9DFF20;--btn:#9DFF20;--btnfg:#000;--brad:0;--line2:#eee}
`, `
<div class="card">
  <div class="ctl"><button class="chip" data-v="tt5">Twenty Twenty-Five</button><button class="chip" data-v="tt4">Twenty Twenty-Four</button><button class="chip" data-v="tt3">Twenty Twenty-Three</button></div>
  <div class="browser"><div class="bbar"><i></i><i></i><i></i><span class="u">pruebas.local/hello-world/</span></div>
    <div class="site" id="site" data-t="tt5">
      <div class="sh"><span class="logo">Pruebas</span><span class="nav">Sample Page</span></div>
      <div class="post"><div class="meta">October 22, 2026</div><h1>Hello world!</h1><div class="img"></div>
        <p>Welcome to WordPress. This is your first post. Edit or delete it, then start writing!</p><span class="btnx">Leave a comment</span></div>
      <div class="sf"><span>Pruebas</span><span>Designed with WordPress</span></div>
    </div>
  </div>
</div>`, `function onSelect(v){document.getElementById('site').dataset.t=v;}` + CHIPS_JS);

/* estilos: Twenty Twenty-Five style variations (values from its styles/*.json) */
const VARIATIONS = {
  Default: { pal: [['Base', '#FFFFFF'], ['Contrast', '#111111'], ['Accent 1', '#FFEE58'], ['Accent 2', '#F6CFF4'], ['Accent 3', '#503AA8'], ['Accent 4', '#686868']], head: 'Manrope', body: 'Manrope' },
  Evening: { pal: [['Base', '#1B1B1B'], ['Contrast', '#F0F0F0'], ['Accent 1', '#786D0A'], ['Accent 2', '#442369'], ['Accent 3', '#D1D0EA'], ['Accent 4', '#CBCBCB']], head: 'Manrope', body: 'Manrope' },
  Noon: { pal: [['Base', '#F8F7F5'], ['Contrast', '#191919'], ['Accent 1', '#FFFFFF'], ['Accent 2', '#F5B684'], ['Accent 3', '#191919'], ['Accent 4', '#5F5F5F']], head: 'Beiruti', body: 'Literata' },
  Twilight: { pal: [['Base', '#131313'], ['Contrast', '#FFFFFF'], ['Accent 1', '#4B52FF'], ['Accent 2', '#FF7A5C'], ['Accent 3', '#252525'], ['Accent 4', '#FFFFFF']], head: 'Roboto Slab', body: 'Manrope' },
  Midnight: { pal: [['Base', '#4433A6'], ['Contrast', '#79F3B1'], ['Accent 1', '#5644BC'], ['Accent 2', '#372696'], ['Accent 3', '#251D51'], ['Accent 4', '#79F3B1']], head: 'Literata', body: 'Fira Sans' },
};
const estilos = page('Variaciones de estilo', `
.wrap{flex:1;min-height:0;display:grid;grid-template-columns:1fr 150px;gap:10px}
.site{border-radius:10px;overflow:hidden;outline:1px solid var(--line);background:var(--base);color:var(--contrast);font-family:var(--body);padding:22px 24px;display:flex;flex-direction:column;gap:12px;transition:background .5s,color .5s}
.site h1{font-family:var(--head);font-size:34px;font-weight:500;line-height:1.1;letter-spacing:-.01em}
.site p{font-size:13px;line-height:1.6;opacity:.85}
.site .row{display:flex;gap:10px;align-items:center}
.site .b{padding:8px 16px;border-radius:999px;background:var(--contrast);color:var(--base);font-size:12px}
.site .tag{padding:4px 10px;border-radius:999px;background:var(--a2);color:var(--contrast);font-size:11px}
.site .box{flex:1;min-height:40px;border-radius:8px;background:var(--a1);display:flex;align-items:flex-end;padding:10px;font-size:11px;color:var(--contrast)}
.site *{transition:background .5s,color .5s,font-family .01s}
.pal{display:flex;flex-direction:column;gap:6px;padding:4px 0}
.sw{display:grid;grid-template-columns:20px 1fr;gap:8px;align-items:center}
.sw b{width:20px;height:20px;border-radius:6px;border:1px solid rgba(0,0,0,.12);transition:background .5s}
.sw span{font-family:var(--mono);font-size:10px;color:var(--muted);line-height:1.2}
.fonts{margin-top:6px;font-family:var(--mono);font-size:10px;color:var(--muted);line-height:1.5}
.fonts b{color:var(--fg);font-weight:600}
`, `
<div class="card">
  <div class="ctl">${Object.keys(VARIATIONS).map(v => `<button class="chip" data-v="${v}">${v}</button>`).join('')}</div>
  <div class="wrap">
    <div class="site" id="site">
      <span class="tag">Twenty Twenty-Five</span>
      <h1>Diseño web para tu negocio</h1>
      <p>El mismo contenido con otra combinación de colores y tipografías.</p>
      <div class="row"><span class="b">Contactar</span></div>
      <div class="row"><div class="box">Accent 1</div><div class="box" style="background:var(--a3);color:var(--base)">Accent 3</div></div>
    </div>
    <div><div class="pal" id="pal"></div><div class="fonts" id="fonts"></div></div>
  </div>
</div>`, `
const V=${JSON.stringify(VARIATIONS)};
function onSelect(v){
  const s=document.getElementById('site'), d=V[v];
  const [base,contrast,a1,a2,a3]=d.pal.map(p=>p[1]);
  Object.entries({'--base':base,'--contrast':contrast,'--a1':a1,'--a2':a2,'--a3':a3,'--head':"'"+d.head+"',serif",'--body':"'"+d.body+"',sans-serif"}).forEach(([k,x])=>s.style.setProperty(k,x));
  document.getElementById('pal').innerHTML=d.pal.map(([n,c])=>'<div class="sw"><b style="background:'+c+'"></b><span>'+n+'<br>'+c+'</span></div>').join('');
  document.getElementById('fonts').innerHTML='títulos <b>'+d.head+'</b><br>texto <b>'+d.body+'</b>';
}` + CHIPS_JS);

/* plantillas: wireframes of Twenty Twenty-Five's basic templates */
const W = (cls, label, extra = '') => `<div class="w ${cls}"${extra}><span>${label}</span></div>`;
const loop = (n = 3) => `<div class="loop">${Array.from({ length: n }, () => `<div class="it">${W('img', 'Featured Image')}<div class="tx">${W('t', 'Post Title')}${W('l', 'Excerpt')}${W('s', 'Date')}</div></div>`).join('')}</div>`;
const TEMPLATES = [
  ['index', 'index.html', 'Index', 'La plantilla de reserva: se usa si no hay otra más concreta.', `${W('h2', 'Blog Heading')}${loop()}${W('pg', 'Pagination')}`],
  ['home', 'home.html', 'Blog Home', 'La página del blog con las últimas entradas.', `${W('h2', 'Blog Heading')}${loop()}${W('pg', 'Pagination')}`],
  ['single', 'single.html', 'Single Posts', 'Cada entrada individual.', `${W('t big', 'Post Title')}${W('img wide', 'Featured Image')}${W('s', 'Written by · Categories')}${W('c', 'Post Content')}${W('s', 'Tags · Post Navigation')}${W('c sm', 'Comments')}`],
  ['page', 'page.html', 'Pages', 'Cada página.', `${W('img wide', 'Featured Image')}${W('t big', 'Post Title')}${W('c tall', 'Post Content')}`],
  ['archive', 'archive.html', 'All Archives', 'Categorías, etiquetas, autores y fechas.', `${W('t', 'Archive Title')}${W('s', 'Term Description')}${loop()}`],
  ['search', 'search.html', 'Search Results', 'Los resultados de una búsqueda.', `${W('t', 'Search Results for…')}${W('srch', 'Search')}${loop()}`],
  ['404', '404.html', 'Page: 404', 'Cuando la dirección no existe.', `<div class="nf">${W('t big', 'Page not found')}${W('l', 'Paragraph')}${W('srch', 'Search')}</div>`],
];
const plantillas = page('Plantillas', `
.tpl{flex:1;min-height:0;overflow:hidden;background:#fff;padding:10px 14px;display:flex;flex-direction:column;gap:7px}
.w{display:flex;align-items:center;justify-content:center;border-radius:5px;background:#f1f1f3;border:1px dashed #d4d4d8;min-height:22px;flex:none}
.w span{font-family:var(--mono);font-size:9px;color:var(--muted)}
.part{background:color-mix(in oklab,var(--acc) 22%,white);border:1px solid color-mix(in oklab,var(--acc) 55%,white);min-height:26px}
.part span{color:oklch(0.45 0.1 70);font-weight:600}
.body{flex:1;min-height:0;display:flex;flex-direction:column;gap:7px;overflow:hidden;animation:fade .45s ease}
@keyframes fade{from{opacity:0;transform:translateY(4px)}}
.t{min-height:26px;width:60%}
.t.big{min-height:34px;width:70%}
.h2{min-height:28px;width:40%}
.img.wide{min-height:44px}
.c{flex:1 1 60px;min-height:16px}
.c.tall{flex-basis:110px}
.c.sm{flex:1 1 34px}
.s{min-height:18px;width:45%}
.l{min-height:18px;width:80%}
.pg{width:35%;align-self:center}
.srch{width:55%;min-height:26px}
.loop{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.it{display:flex;flex-direction:column;gap:5px}
.it .img{min-height:44px}
.it .tx{display:flex;flex-direction:column;gap:4px}
.it .t,.it .l,.it .s{width:auto;min-height:16px}
.nf{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px}
.nf .t,.nf .l{width:60%}
`, `
<div class="card">
  <div class="ctl">${TEMPLATES.map(t => `<button class="chip" data-v="${t[0]}">${t[1]}</button>`).join('')}</div>
  <div class="browser"><div class="bbar"><i></i><i></i><i></i><span class="u" id="url">pruebas.local/</span></div>
    <div class="tpl">${W('part', 'Header · template part')}<div class="body" id="body"></div>${W('part', 'Footer · template part')}</div>
  </div>
  <div class="cap" id="cap"><span class="n" id="cn"></span><span class="t" id="ct"></span><span class="d" id="cd"></span></div>
</div>`, `
const T=${JSON.stringify(TEMPLATES)};
const URLS={index:'pruebas.local/',home:'pruebas.local/',single:'pruebas.local/hello-world/',page:'pruebas.local/sample-page/',archive:'pruebas.local/category/uncategorized/',search:'pruebas.local/?s=hola',404:'pruebas.local/no-existe/'};
function onSelect(v){
  const t=T.find(x=>x[0]===v), b=document.getElementById('body'), cap=document.getElementById('cap');
  b.style.animation='none'; b.offsetHeight; b.style.animation='';
  b.innerHTML=t[4];
  document.getElementById('url').textContent=URLS[v];
  cap.classList.add('swap');
  setTimeout(()=>{document.getElementById('cn').textContent=t[1];document.getElementById('ct').textContent=t[2];document.getElementById('cd').textContent=t[3];cap.classList.remove('swap');},150);
}` + CHIPS_JS);

/* ---------------------------------------------------------------- write */

const ADMIN_DEMOS = {
  temas: {
    title: 'Themes', mock: adminScreen({ current: 'Appearance', currentSub: 0, main: themesMain }), css: ADMIN_CSS,
    zones: [
      ['t-active', 'Twenty Twenty-Five', 'Tema activo', 'El que se está usando ahora. Siempre va el primero.'],
      ['t-customize', 'Customize', 'Personalizar', 'Abre las opciones para ajustar el tema activo.'],
      ['t-card', 'Twenty Twenty-Four', 'Tema instalado', 'Instalado, pero inactivo: no afecta a la web.'],
      ['t-details', 'Theme Details', 'Detalles', 'Versión, autor, descripción y opción de borrarlo.'],
      ['t-activate', 'Activate', 'Activar', 'Lo pone en marcha y desactiva el actual.'],
      ['t-preview', 'Live Preview', 'Vista previa', 'Lo prueba con tu contenido antes de activarlo.'],
      ['t-count', '3', 'Temas instalados', 'Cuántos temas hay instalados.'],
      ['t-addbtn', 'Add Theme', 'Añadir tema', 'Abre el directorio de temas.'],
      ['t-add', 'Add Theme', 'Añadir tema', 'Otro acceso al directorio de temas.'],
    ],
    view: [160, 32, 940, 560], size: { w: 1100, h: 640 },
  },
  store: {
    title: 'Add Themes', mock: adminScreen({ current: 'Appearance', currentSub: 0, main: storeMain }), css: ADMIN_CSS,
    zones: [
      ['s-tabs', 'Popular · Latest · Block Themes · Favorites', 'Explorar', 'Los más instalados, los más nuevos…'],
      ['s-feature', 'Feature Filter', 'Filtrar', 'Por características: colores, columnas, tipo de web…'],
      ['s-search', 'Search Themes', 'Buscar', 'Busca un tema por su nombre o tema.'],
      ['s-installed', 'Twenty Twenty-Five', 'Ya instalado', 'Los que ya tienes aparecen marcados.'],
      ['s-card', 'Hello Elementor', 'Un tema del directorio', 'Gratis y revisado por WordPress.org.'],
      ['s-details', 'Details & Preview', 'Detalles', 'Descripción, valoraciones y vista previa.'],
      ['s-install', 'Install · Preview', 'Instalar', 'Lo descarga a tu WordPress (después hay que activarlo).'],
      ['s-upload', 'Upload Theme', 'Subir tema', 'Instala un tema desde un archivo .zip.'],
    ],
    view: [160, 32, 940, 520], size: { w: 1100, h: 640 },
  },
};

for (const [name, demo] of Object.entries(ADMIN_DEMOS)) {
  fs.mkdirSync(path.join(OUT, name), { recursive: true });
  fs.writeFileSync(path.join(OUT, name, 'index.html'), buildDemo(demo));
}
for (const [name, html] of Object.entries({ cambio, estilos, plantillas })) {
  fs.mkdirSync(path.join(OUT, name), { recursive: true });
  fs.writeFileSync(path.join(OUT, name, 'index.html'), html);
}
console.log([...Object.keys(ADMIN_DEMOS), 'cambio', 'estilos', 'plantillas'].join(' '));

// Generates the Media queries & Container queries demos: node scripts/generate-queries-demos.mjs public/media/css/media-queries
// - responsive: the same page on a phone, a tablet and a desktop
// - media: pick a screen width and see which @media blocks apply
// - container: the screen stays the same, the container changes width
// - media-vs-container: the same card in a wide column and a narrow sidebar
import fs from 'node:fs'; import path from 'node:path';
const OUT = process.argv[2];

const write = (name, html) => {
  fs.mkdirSync(path.join(OUT, name), { recursive: true });
  fs.writeFileSync(path.join(OUT, name, 'index.html'), html);
};

/* ------------------------------------------------- shared look */

const BASE = `*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%}
body{overflow:hidden;background:oklch(0.9524 0.0013 286.37);color:oklch(0.2103 0.0059 285.89);display:flex;align-items:center;justify-content:center;padding:8px clamp(8px,3vw,24px);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased}
:root{--acc:oklch(0.6204 0.195 253.83);--fg:oklch(0.2103 0.0059 285.89);--muted:oklch(0.5517 0.0138 285.94);--line:oklch(90% 0.004 286.32);--soft:oklch(0.97 0.0015 286);--tint:color-mix(in oklab,var(--acc) 14%,white);--mono:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;--code:'SFMono-Regular',ui-monospace,Menlo,Consolas,monospace;--ease:cubic-bezier(.22,1,.36,1)}
.card{width:100%;max-width:600px;max-height:100%;background:#fff;border:1px solid var(--line);border-radius:16px;box-shadow:0 2px 4px 0 rgba(0,0,0,.04),0 1px 2px 0 rgba(0,0,0,.06),0 0 1px 0 rgba(0,0,0,.06);padding:14px 16px;display:flex;flex-direction:column;gap:12px;opacity:0;transform:translateY(6px);animation:in .45s var(--ease) .05s forwards}
@keyframes in{to{opacity:1;transform:none}}
.ctl{display:flex;align-items:center;flex-wrap:wrap;gap:6px;flex-shrink:0}
.prop{font-size:12.5px;font-weight:500;color:var(--muted);margin-right:6px}
.chip{font-family:var(--mono);font-size:12.5px;font-weight:500;line-height:1;padding:7px 12px;border-radius:999px;border:1px solid var(--line);background:#fff;color:var(--fg);cursor:pointer;transition:background .2s,color .2s,border-color .2s}
.chip:hover{border-color:oklch(80% 0.006 286)}
.chip.on{background:var(--fg);border-color:var(--fg);color:#fff}
.lbl{font-size:11.5px;font-weight:500;color:var(--muted);font-variant-numeric:tabular-nums;white-space:nowrap}
.lbl b{color:var(--fg);font-weight:600}
.split{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:14px;align-items:center}
.code{font-family:var(--code);font-size:11px;line-height:1.6;background:var(--soft);border:1px solid var(--line);border-radius:12px;padding:10px 0;white-space:pre;overflow:hidden;flex-shrink:0}
.code .l{display:block;padding:0 12px;border-left:3px solid transparent;transition:opacity .35s,background .35s,border-color .35s}
.code .blk{display:block}
.code .blk.off .l{opacity:.32}
.code .blk.on .l{background:var(--tint);border-left-color:var(--acc)}
.k{color:var(--acc);font-weight:600}
.c{color:var(--muted)}
/* mini page pieces */
.pg{background:#fff;border-radius:6px;display:flex;flex-direction:column;gap:5px;padding:6px;height:100%;overflow:hidden}
.pg .bar{height:12px;border-radius:3px;background:var(--fg);display:flex;align-items:center;justify-content:flex-end;gap:3px;padding:0 4px;flex-shrink:0}
.pg .bar i{display:block;width:10px;height:2px;border-radius:1px;background:#fff;opacity:.7}
.pg .bar .burger{width:7px;height:5px;background:none;border-top:1.5px solid #fff;border-bottom:1.5px solid #fff;position:relative;opacity:.85}
.pg .hero{height:22px;border-radius:3px;background:var(--tint);flex-shrink:0}
.pg .grid{display:grid;gap:5px;transition:none}
.pg .grid b{display:block;height:26px;border-radius:3px;background:color-mix(in oklab,var(--acc) 34%,white)}
`;

// chips + autoplay through the first control until someone clicks
const ENGINE = `
const groups=[...document.querySelectorAll('.ctl')];
let auto=true;
function pick(g,chip){g.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===chip));apply(g.dataset.ctl,chip.dataset.v);}
groups.forEach(g=>g.querySelectorAll('.chip').forEach(c=>c.addEventListener('click',()=>{auto=false;pick(g,c);})));
groups.forEach(g=>pick(g,g.querySelector('.chip.on')));
setInterval(()=>{if(!auto)return;const g=groups[0];const cs=[...g.querySelectorAll('.chip')];const i=cs.findIndex(c=>c.classList.contains('on'));pick(g,cs[(i+1)%cs.length]);},3200);
`;

const page = (title, css, body, js) => `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title>
<style>
${BASE}${css}
</style></head>
<body>
${body}
<script>
${js}
${ENGINE}
</script>
</body></html>
`;

const chips = (ctl, label, values, on = 0) =>
  `<div class="ctl" data-ctl="${ctl}"><span class="prop">${label}</span>${values
    .map(([v, t], i) => `<button class="chip${i === on ? ' on' : ''}" data-v="${v}">${t}</button>`).join('')}</div>`;

const miniPage = (cards = 6, burger = false) =>
  `<div class="pg"><div class="bar">${burger ? '<i class="burger"></i>' : '<i></i><i></i><i></i>'}</div><div class="hero"></div><div class="grid">${'<b></b>'.repeat(cards)}</div></div>`;

/* ------------------------------------------------- responsive */

write('responsive', `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Responsive</title>
<style>
${BASE}
.row{display:flex;align-items:flex-end;justify-content:center;gap:clamp(12px,3vw,24px)}
.dev{display:flex;flex-direction:column;align-items:center;gap:10px;opacity:0;transform:translateY(8px);animation:in .5s var(--ease) forwards}
.dev:nth-child(1){animation-delay:.15s}.dev:nth-child(2){animation-delay:.3s}.dev:nth-child(3){animation-delay:.45s}
.scr{background:var(--fg);padding:5px;border-radius:12px}
.scr .pg{border-radius:7px}
.phone .scr{width:74px;height:146px;border-radius:14px;padding:4px}
.tab .scr{width:140px;height:178px}
.desk .scr{width:250px;height:156px;border-radius:8px}
.desk .stand{width:60px;height:14px;background:var(--line);clip-path:polygon(20% 0,80% 0,100% 100%,0 100%);margin-top:-6px}
.phone .grid{grid-template-columns:1fr}
.tab .grid{grid-template-columns:repeat(2,1fr)}
.desk .grid{grid-template-columns:repeat(3,1fr)}
.desk .pg .grid b{height:30px}
</style></head>
<body>
<div class="card">
<div class="row">
<div class="dev phone"><div class="scr">${miniPage(6, true)}</div><span class="lbl"><b>móvil</b> · 360px</span></div>
<div class="dev tab"><div class="scr">${miniPage(6)}</div><span class="lbl"><b>tablet</b> · 768px</span></div>
<div class="dev desk"><div><div class="scr">${miniPage(6)}</div></div><span class="lbl"><b>escritorio</b> · 1280px</span></div>
</div>
</div>
</body></html>
`);

/* ------------------------------------------------- media */

write('media', page('@media', `
.screen{height:180px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:8px}
.scr{background:var(--fg);padding:4px;border-radius:9px;height:150px;transition:width .6s var(--ease)}
.scr .pg{border-radius:5px}
.grid b{transition:height .3s}
`, `<div class="card">
${chips('w', 'Ancho de pantalla:', [['360', '360px'], ['768', '768px'], ['1280', '1280px']])}
<div class="split">
<div class="screen"><div class="scr" id="scr">${miniPage(6)}</div><span class="lbl" id="w"></span></div>
<div class="code"><span class="blk on"><span class="l c">/* 1 columna */</span></span><span class="blk" id="b1"><span class="l"><span class="k">@media (min-width: 768px)</span> {</span><span class="l c">  /* 2 columnas */</span><span class="l">}</span></span><span class="blk" id="b2"><span class="l"><span class="k">@media (min-width: 1024px)</span> {</span><span class="l c">  /* 3 columnas */</span><span class="l">}</span></span></div>
</div>
</div>`, `
const scr=document.getElementById('scr'),grid=scr.querySelector('.grid'),wl=document.getElementById('w');
const b1=document.getElementById('b1'),b2=document.getElementById('b2');
const SIZE={360:70,768:150,1280:228};
function apply(_,v){
  const w=+v;
  scr.style.width=SIZE[w]+'px';
  const cols=w>=1024?3:w>=768?2:1;
  grid.style.gridTemplateColumns='repeat('+cols+',1fr)';
  b1.className='blk '+(w>=768?'on':'off');
  b2.className='blk '+(w>=1024?'on':'off');
  wl.innerHTML='pantalla · <b>'+w+'px</b>';
}`));

/* ------------------------------------------------- container */

const CARD_CSS = `
.tj{display:flex;flex-direction:column;gap:10px;padding:10px;border-radius:12px;background:#fff;border:1px solid var(--line)}
.tj .ph{aspect-ratio:16/9;border-radius:8px;background:linear-gradient(135deg,color-mix(in oklab,var(--acc) 30%,white),var(--acc));flex-shrink:0}
.tj .tx{flex:1;display:flex;flex-direction:column;gap:6px;min-width:0}
.tj .tx b{display:block;height:9px;border-radius:3px;background:var(--fg);width:70%}
.tj .tx i{display:block;height:6px;border-radius:3px;background:var(--line)}
.tj .tx i:last-child{width:60%}
`;
const tarjeta = `<div class="tj"><div class="ph"></div><div class="tx"><b></b><i></i><i></i><i></i></div></div>`;

write('container', page('@container', `${CARD_CSS}
.screen{position:relative;height:200px;border-radius:12px;background:var(--soft);border:1px solid var(--line);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:26px 10px 10px}
.screen>.lbl:first-child{position:absolute;top:8px;left:10px}
.box{outline:1.5px dashed var(--acc);outline-offset:4px;border-radius:12px;transition:width .6s var(--ease)}
.tj{padding:7px;gap:7px;border-radius:9px}
.tj .ph{aspect-ratio:2/1;border-radius:6px}
.tj .tx{gap:5px}.tj .tx b{height:7px}.tj .tx i{height:5px}
.row .tj{flex-direction:row;align-items:center}.row .tj .ph{width:42%}
`, `<div class="card">
${chips('w', 'Ancho del contenedor:', [['260', '260px'], ['420', '420px'], ['560', '560px']])}
<div class="split">
<div class="screen"><span class="lbl">pantalla · <b>1280px</b></span><div class="box" id="box">${tarjeta}</div><span class="lbl" id="w"></span></div>
<div class="code"><span class="l">.columna {</span><span class="l">  <span class="k">container-type: inline-size;</span></span><span class="l">}</span><span class="l"> </span><span class="blk" id="b1"><span class="l"><span class="k">@container (min-width: 400px)</span> {</span><span class="l">  .tarjeta {</span><span class="l">    flex-direction: row;</span><span class="l">  }</span><span class="l">}</span></span></div>
</div>
</div>`, `
const box=document.getElementById('box'),wl=document.getElementById('w'),b1=document.getElementById('b1');
// the drawing is scaled down: 560px of container = 224px on screen
function apply(_,v){
  const w=+v;
  box.style.width=Math.round(w*0.4)+'px';
  box.classList.toggle('row',w>=400);
  b1.className='blk '+(w>=400?'on':'off');
  wl.innerHTML='contenedor · <b>'+w+'px</b>';
}`));

/* ------------------------------------------------- media vs container */

write('media-vs-container', page('@media o @container', `${CARD_CSS}
.screen{display:flex;flex-direction:column;gap:8px}
.site{display:grid;grid-template-columns:1fr 150px;gap:12px;padding:12px;border-radius:12px;background:var(--soft);border:1px solid var(--line);align-items:start}
.col{display:flex;flex-direction:column;gap:6px;min-width:0}
.col>.lbl{padding-left:2px}
.head{display:flex;justify-content:space-between;align-items:center}
.rule{font-family:var(--code);color:var(--acc);font-weight:600}
.tj .ph{aspect-ratio:2/1;transition:width .5s var(--ease)}
.row .tj{flex-direction:row;align-items:center}.row .tj .ph{width:42%}
/* the screen is wide, so with @media the sidebar card also goes horizontal and gets squeezed */
body[data-m="media"] .side .tj{outline:1.5px solid oklch(0.63 0.22 25);outline-offset:3px}
body[data-m="container"] .box{outline:1.5px dashed var(--acc);outline-offset:3px;border-radius:12px}
`, `<div class="card">
${chips('m', 'La tarjeta pregunta a:', [['media', '@media'], ['container', '@container']])}
<div class="screen">
<div class="head"><span class="lbl">pantalla · <b>1280px</b></span><span class="lbl rule" id="th"></span></div>
<div class="site">
<div class="col"><span class="lbl">main · <b>380px</b></span><div class="box" id="main">${tarjeta}</div></div>
<div class="col side"><span class="lbl">aside · <b>150px</b></span><div class="box" id="side">${tarjeta}</div></div>
</div>
</div>
</div>`, `
const main=document.getElementById('main'),side=document.getElementById('side');
function apply(_,v){
  document.body.dataset.m=v;
  document.getElementById('th').textContent=v==='media'?'@media (min-width: 768px)':'@container (min-width: 300px)';
  main.classList.add('row');
  // @media looks at the 1280px screen; @container looks at the 150px sidebar
  side.classList.toggle('row',v==='media');
}`));

console.log('ok');

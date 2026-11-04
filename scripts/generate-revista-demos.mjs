// Generates the demos for the "Revista digital" group project: node scripts/generate-revista-demos.mjs public/media/ejercicios/revista
// - quien: an example magazine home; each zone says which roles lead it (shared engine in lib/wp-admin-demo.mjs)
// - plantillas: home / archive / single post side by side, and the loop item repeated in all of them
// - equipo: who leads, takes part or is consulted in each phase
import fs from 'node:fs'; import path from 'node:path';
import { buildDemo } from './lib/wp-admin-demo.mjs';
const OUT = process.argv[2];

const write = (name, html) => {
  fs.mkdirSync(path.join(OUT, name), { recursive: true });
  fs.writeFileSync(path.join(OUT, name, 'index.html'), html);
};

/* ------------------------------------------------- the example magazine */

// placeholder "photos": soft gradients, no remote images
const PHOTOS = [
  'linear-gradient(135deg,#f6c38b,#e0603f 55%,#5b1f3a)',
  'linear-gradient(135deg,#9ad0c2,#2f7a78 60%,#173a4a)',
  'linear-gradient(135deg,#c9b6f2,#6c4bd1 60%,#2a1f5c)',
  'linear-gradient(135deg,#f3e3a1,#d9a227 55%,#6b4a12)',
  'linear-gradient(135deg,#f2b5c4,#d0476d 60%,#4e1530)',
];
const POSTS = [
  ['Discos', 'El vinilo vuelve a sonar en los barrios', '12 oct'],
  ['Directos', 'Crónica: tres noches de festival bajo la lluvia', '10 oct'],
  ['Entrevistas', '“Grabamos el disco en una cocina”', '8 oct'],
  ['Actualidad', 'Las salas pequeñas resisten', '5 oct'],
];

const MAG_CSS = `
:root{--acc:oklch(0.2103 0.0059 285.89)}
.hl{background:color-mix(in oklab,var(--acc) 6%,transparent)}
.wp.mag{background:#fbfaf7;color:#16161a;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.mag .top{position:absolute;left:0;right:0;top:0;height:70px;display:flex;align-items:center;gap:40px;padding:0 40px;border-bottom:1px solid #e7e4dc;background:#fff}
.mag .logo{font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:700;letter-spacing:-.02em}
.mag .logo i{color:#e0603f;font-style:normal}
.mag .nav{display:flex;gap:26px;font-size:14px;font-weight:500;color:#4a4a52}
.mag .nav b{color:#16161a;font-weight:600}
.mag .sub{margin-left:auto;padding:9px 16px;border-radius:999px;background:#16161a;color:#fff;font-size:13px;font-weight:600}
.mag .hero{position:absolute;left:40px;right:40px;top:92px;height:236px;display:grid;grid-template-columns:1.25fr 1fr;gap:32px;align-items:center}
.mag .hero .ph{height:100%;border-radius:14px}
.mag .tag{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#e0603f}
.mag .hero h1{font-weight:700;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.08;letter-spacing:-.02em;margin:10px 0 12px}
.mag .hero p{font-size:14px;line-height:1.55;color:#5b5b63}
.mag .meta{font-size:12px;color:#8a8a92;margin-top:14px}
.mag .sec{position:absolute;left:40px;right:40px;top:350px;display:flex;align-items:baseline;justify-content:space-between}
.mag .sec h3{font-size:15px;font-weight:700}
.mag .sec span{font-size:12.5px;color:#8a8a92}
.mag .grid{position:absolute;left:40px;right:40px;top:380px;display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.mag .it{display:flex;flex-direction:column;gap:9px}
.mag .it .ph{height:112px;border-radius:10px}
.mag .it h4{font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.2;letter-spacing:-.01em}
.mag .it .meta{margin-top:0}
.mag .foot{position:absolute;left:0;right:0;bottom:0;height:62px;display:flex;align-items:center;gap:28px;padding:0 40px;background:#16161a;color:#c9c9cf;font-size:13px}
.mag .foot .logo{font-size:20px;color:#fff}
.mag .foot span:last-child{margin-left:auto;color:#8a8a92;font-size:12px}
`;

const card = ([cat, title, date], i, zones) => `
      <div class="it"${zones ? ' data-z="item"' : ''}>
        <div class="ph"${zones ? ' data-z="img"' : ''} style="background:${PHOTOS[i + 1]}"></div>
        <div${zones ? ' data-z="txt"' : ''}><div class="tag">${cat}</div><h4>${title}</h4></div>
        <div class="meta">${date}</div>
      </div>`;

const magMock = `
<div class="wp mag" id="wp">
  <div class="top" data-z="header">
    <span class="logo">Altavoz<i>.</i></span>
    <nav class="nav" data-z="nav"><b>Inicio</b><span>Actualidad</span><span>Discos</span><span>Directos</span><span>Entrevistas</span></nav>
    <span class="sub">Suscríbete</span>
  </div>
  <div class="hero" data-z="hero">
    <div class="ph" style="background:${PHOTOS[0]}"></div>
    <div><div class="tag">Reportaje</div><h1 data-z="h1">La nueva escena que suena en los garajes</h1>
      <p>Grupos que ensayan donde pueden, graban en casa y llenan salas sin pasar por la radio.</p><div class="meta">Por la redacción · 14 oct</div></div>
  </div>
  <div class="sec"><h3 data-z="h2">Lo último</h3><span>Ver todo →</span></div>
  <div class="grid" data-z="grid">${POSTS.map((p, i) => card(p, i, i === 0)).join('')}
  </div>
  <div class="foot" data-z="footer"><span class="logo">Altavoz<i>.</i></span><span>Sobre nosotros</span><span>Contacto</span><span>Aviso legal</span><span>© 2026 · Revista de ejemplo</span></div>
</div>`;

write('quien', buildDemo({
  title: '¿Quién hace qué?',
  mock: magMock,
  css: MAG_CSS,
  dashicons: 'data:text/css,',
  view: [0, 0, 1100, 640],
  zones: [
    ['header', 'Header', 'Diseño · Desarrollo · Edición', 'Diseño crea el logo, Desarrollo la construye y Edición escribe sus textos: menú y botón.'],
    ['nav', 'Menú de categorías', 'Edición · Desarrollo', 'Edición decide las secciones de la revista; Desarrollo las convierte en menú.'],
    ['hero', 'Artículo destacado', 'Edición · Diseño', 'Edición elige qué artículo abre la portada y revisa que su titular se vea completo.'],
    ['h1', 'Título principal', 'Edición', 'El H1 de la página. Edición vigila que haya uno solo y que los demás títulos sigan el orden.'],
    ['h2', 'Título de sección', 'Edición', 'Un H2: divide la página en secciones, siempre por debajo del H1.'],
    ['grid', 'Loop grid', 'Desarrollo', 'La rejilla de últimos artículos. Se rellena sola cada vez que se publica.'],
    ['item', 'Loop item', 'Diseño · Desarrollo', 'La tarjeta de un artículo: Diseño la dibuja, Desarrollo la convierte en plantilla.'],
    ['img', 'Imagen destacada', 'Edición', 'Edición la busca y la prepara; la tarjeta solo la muestra.'],
    ['txt', 'Categoría y titular', 'Edición', 'Los escribe Edición, y comprueba que la tarjeta los muestre bien: sin cortes ni textos de prueba.'],
    ['footer', 'Footer', 'Edición · Diseño · Desarrollo', 'Edición escribe sus textos: quiénes somos, contacto, aviso legal…'],
  ],
}));

/* ------------------------------------------------- shared look for the non-engine demos */

const BASE = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%}
body{overflow:hidden;background:oklch(0.9524 0.0013 286.37);color:oklch(0.2103 0.0059 285.89);display:flex;align-items:center;justify-content:center;padding:6px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased}
:root{--acc:oklch(0.2103 0.0059 285.89);--fg:oklch(0.2103 0.0059 285.89);--muted:oklch(0.5517 0.0138 285.94);--line:oklch(90% 0.004 286.32);--soft:oklch(0.97 0.0015 286);--mono:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.card{width:100%;height:100%;background:#fff;border:1px solid var(--line);border-radius:16px;box-shadow:0 2px 4px 0 rgba(0,0,0,.04),0 1px 2px 0 rgba(0,0,0,.06),0 0 1px 0 rgba(0,0,0,.06);padding:16px;display:flex;flex-direction:column;gap:14px;opacity:0;transform:translateY(6px);animation:in .45s cubic-bezier(.22,1,.36,1) .05s forwards}
@keyframes in{to{opacity:1;transform:none}}
.ctl{display:flex;flex-wrap:wrap;gap:6px;flex:none}
.chip{font-family:var(--mono);font-size:12.5px;font-weight:500;line-height:1;padding:7px 12px;border-radius:999px;border:1px solid var(--line);background:#fff;color:var(--fg);cursor:pointer;transition:background .2s,color .2s}
.chip.on{background:var(--fg);border-color:var(--fg);color:#fff}
.cap{flex:none;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;padding:0 4px 2px;min-height:18px;transition:opacity .2s}
.cap.swap{opacity:0}
.cap .n{font-size:14px;font-weight:600;letter-spacing:-.005em}
.cap .t{font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--acc)}
.cap .d{font-size:13px;font-weight:500;color:var(--muted)}
`;
const CAP = '<div class="cap" id="cap"><span class="n" id="cn"></span><span class="t" id="ct"></span><span class="d" id="cd"></span></div>';
const CAPTION_JS = `
function caption(n,t,d){const c=document.getElementById('cap');c.classList.add('swap');setTimeout(()=>{document.getElementById('cn').textContent=n;document.getElementById('ct').textContent=t;document.getElementById('cd').textContent=d;c.classList.remove('swap');},150);}
`;
const page = (title, css, body, js) => `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title>
<style>${BASE}${css}</style></head>
<body>${body}<script>${CAPTION_JS}${js}</script></body></html>
`;

/* ------------------------------------------------- plantillas: the templates of a magazine */

const mini = (i) => `<div class="mi"><i style="background:${PHOTOS[i]}"></i><b></b><s></s></div>`;
const chrome = (label, body) => `
  <div class="win" data-w="${label}">
    <div class="wbar"><span></span><span></span><span></span><em>${label}</em></div>
    <div class="wbody">
      <div class="hd part"><b class="lg">Altavoz.</b><span></span><span></span><span></span></div>
      <div class="main">${body}</div>
      <div class="ft part"></div>
    </div>
  </div>`;

const plantillas = page('Las plantillas de la revista', `
.stage{position:relative;flex:1;min-height:0;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.win{display:flex;flex-direction:column;min-height:0;border-radius:10px;overflow:hidden;outline:1px solid var(--line);background:#fbfaf7;transition:opacity .35s,transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s}
.wbar{flex:none;display:flex;align-items:center;gap:5px;height:26px;padding:0 10px;background:var(--soft);border-bottom:1px solid var(--line)}
.wbar span{width:8px;height:8px;border-radius:50%;background:oklch(85% 0.004 286)}
.wbar em{margin-left:8px;font-style:normal;font-size:11px;font-weight:600;color:var(--muted)}
.wbody{flex:1;min-height:0;display:flex;flex-direction:column}
.hd{flex:none;display:flex;align-items:center;gap:8px;height:30px;padding:0 10px;background:#fff;border-bottom:1px solid #e7e4dc}
.hd .lg{font-family:Georgia,serif;font-size:13px;margin-right:auto}
.hd span{width:22px;height:5px;border-radius:3px;background:#d9d6ce}
.ft{flex:none;height:22px;background:#16161a}
.main{flex:1;min-height:0;padding:10px;display:flex;flex-direction:column;gap:8px;overflow:hidden}
.big{height:30%;min-height:50px;border-radius:7px}
.ttl{height:9px;border-radius:4px;background:#16161a;width:70%}
.ttl.s{width:45%}
.ln{height:5px;border-radius:3px;background:#d9d6ce}
.ln.s{width:80%}
.chipcat{align-self:flex-start;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#e0603f}
.loops{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.mi{display:flex;flex-direction:column;gap:4px;padding:3px;border-radius:7px;transition:background .3s,box-shadow .3s}
.mi i{height:34px;border-radius:5px}
.mi b{height:6px;border-radius:3px;background:#16161a;width:85%}
.mi s{height:4px;border-radius:2px;background:#d9d6ce;width:50%}
.filters{display:flex;gap:4px}
.filters span{height:12px;width:34px;border-radius:6px;border:1px solid #d9d6ce}
.filters span:first-child{background:#16161a;border-color:#16161a}
/* selection states */
.stage.pick .win{opacity:.35}
.stage.pick .win.on{opacity:1;transform:translateY(-3px);box-shadow:0 0 0 3px var(--acc)}
.stage.loop .mi{background:color-mix(in oklab,var(--acc) 8%,white);box-shadow:0 0 0 2px var(--acc)}
.stage.parts .part{box-shadow:inset 0 0 0 2px var(--acc);background-color:color-mix(in oklab,var(--acc) 10%,white)}
.stage.parts .ft.part{background:var(--acc)}
`, `
<div class="card">
  <div class="ctl">
    <button class="chip" data-v="home">Home</button><button class="chip" data-v="archive">Archive</button><button class="chip" data-v="single">Single post</button><button class="chip" data-v="loop">Loop item</button><button class="chip" data-v="parts">Header y footer</button>
  </div>
  <div class="stage" id="st">
    ${chrome('Home', `<div class="big" style="background:${PHOTOS[0]}"></div><div class="ttl"></div><div class="ln s"></div><div class="loops">${[1, 2, 3, 4].map(mini).join('')}</div>`)}
    ${chrome('Archive', `<div class="chipcat">Categoría · Discos</div><div class="ttl s"></div><div class="filters"><span></span><span></span><span></span></div><div class="loops">${[2, 4, 1, 3, 4, 2].map(mini).join('')}</div>`)}
    ${chrome('Single post', `<div class="chipcat">Discos</div><div class="ttl"></div><div class="ln s"></div><div class="big" style="background:${PHOTOS[2]}"></div><div class="ln"></div><div class="ln"></div><div class="ln s"></div><div class="ln"></div><div class="ln s"></div>`)}
  </div>
  ${CAP}
</div>`, `
const INFO={
  home:['Home','Portada','La entrada a la revista: el destacado, lo último y las secciones.'],
  archive:['Archive','Archivo','Los artículos de una categoría. Una sola plantilla sirve para todas las categorías.'],
  single:['Single post','Artículo','La página de cada artículo. Se diseña una vez y la usan todos.'],
  loop:['Loop item','Tarjeta','La misma tarjeta se repite en la portada y en el archivo, cada vez con un artículo distinto.'],
  parts:['Header y footer','Partes comunes','La cabecera y el pie: se construyen una vez y aparecen en todas las páginas.'],
};
const st=document.getElementById('st'),wins=[...document.querySelectorAll('.win')];
function onSelect(v){
  st.classList.toggle('pick',v==='home'||v==='archive'||v==='single');
  st.classList.toggle('loop',v==='loop');
  st.classList.toggle('parts',v==='parts');
  const name={home:'Home',archive:'Archive',single:'Single post'}[v];
  wins.forEach(w=>w.classList.toggle('on',w.dataset.w===name));
  caption(...INFO[v]);
}
const chips=[...document.querySelectorAll('.chip')];let timer=null;
function pick(c){chips.forEach(x=>x.classList.toggle('on',x===c));onSelect(c.dataset.v);}
chips.forEach(c=>c.addEventListener('click',()=>{clearInterval(timer);pick(c);}));
pick(chips[0]);
timer=setInterval(()=>{const i=chips.findIndex(c=>c.classList.contains('on'));pick(chips[(i+1)%chips.length]);},3200);
`);
write('plantillas', plantillas);

/* ------------------------------------------------- equipo: shared responsibilities */

const ROLES = [
  ['Diseño', 'UX/UI', 'Identidad visual, plantillas y coherencia de toda la revista.'],
  ['Desarrollo', 'WordPress', 'Convierte el diseño en una web real, dinámica y responsive.'],
  ['Edición', 'Content manager', 'Todos los textos de la revista: artículos, textos de la web y orden de los títulos.'],
];
// L = lidera · P = participa · C = consulta
const PHASES = [
  ['Conceptualización', 'LPP'],
  ['Identidad visual', 'LCC'],
  ['Arquitectura web', 'PLP'],
  ['Diseño de plantillas', 'LPC'],
  ['Creación de artículos', 'CCL'],
  ['Textos y títulos de la web', 'PPL'],
  ['Construcción en WordPress', 'PLP'],
  ['Carga de contenidos', 'PPL'],
  ['Revisión de textos en plantillas', 'CPL'],
  ['Revisión final', 'PPP'],
];
const LABEL = { L: 'Lidera', P: 'Participa', C: 'Consulta' };

const equipo = page('Quién hace qué en cada fase', `
.tbl{flex:1;min-height:0;display:grid;grid-template-columns:auto repeat(3,1fr);grid-template-rows:auto repeat(${PHASES.length},1fr);align-content:stretch;position:relative}
.c{display:flex;align-items:center;justify-content:center;padding:0 6px;border-top:1px solid var(--line);font-size:13px;position:relative;z-index:1;opacity:0;transform:translateY(4px);animation:in .45s cubic-bezier(.22,1,.36,1) forwards}
.c.ph{justify-content:flex-start;font-weight:500;font-size:12.5px;padding-left:6px;padding-right:16px;white-space:nowrap}
.c.h{border-top:0;flex-direction:column;gap:2px;padding:4px 10px 10px;cursor:default}
.c.h b{font-size:14px;font-weight:600}
.c.h span{font-size:10px;font-weight:700;letter-spacing:.1em;text-align:center;text-transform:uppercase;color:var(--muted)}
.p{display:inline-flex;align-items:center;justify-content:center;width:100%;max-width:96px;padding:5px 8px;border-radius:999px;font-size:12px;font-weight:500;line-height:1}
.p.L{background:var(--acc);color:#fff;font-weight:600}
.p.P{background:color-mix(in oklab,var(--acc) 9%,white)}
.p.C{border:1px solid var(--line);color:var(--muted)}
.col{position:absolute;top:0;bottom:0;border-radius:10px;background:var(--soft);outline:2px solid color-mix(in oklab,var(--acc) 70%,white);opacity:0;transition:left .35s cubic-bezier(.22,1,.36,1),opacity .25s;z-index:0;pointer-events:none}
.col.on{opacity:1}
`, `
<div class="card">
  <div class="tbl" id="tbl">
    <div class="col" id="col"></div>
    <div class="c h" style="animation-delay:.05s"></div>
    ${ROLES.map(([n, s], j) => `<div class="c h" data-col="${j}" style="animation-delay:.05s"><b>${n}</b><span>${s}</span></div>`).join('')}
    ${PHASES.map(([name, cells], i) => `<div class="c ph" style="animation-delay:${(0.1 + i * 0.06).toFixed(2)}s">${name}</div>${[...cells].map((k, j) => `<div class="c" data-col="${j}" style="animation-delay:${(0.1 + i * 0.06).toFixed(2)}s"><span class="p ${k}">${LABEL[k]}</span></div>`).join('')}`).join('')}
  </div>
  ${CAP}
</div>`, `
const ROLES=${JSON.stringify(ROLES)};
const tbl=document.getElementById('tbl'),col=document.getElementById('col');
const heads=[...document.querySelectorAll('.c.h[data-col]')];
let cur=-1,timer=null;
function show(j){
  if(j===cur)return;cur=j;
  const h=heads[j];
  col.style.left=h.offsetLeft+'px';col.style.width=h.offsetWidth+'px';col.classList.add('on');
  caption(ROLES[j][0],ROLES[j][1],ROLES[j][2]);
}
tbl.addEventListener('mousemove',e=>{
  const c=e.target.closest('[data-col]');
  if(c){clearInterval(timer);timer=null;show(+c.dataset.col);}
});
tbl.addEventListener('mouseleave',()=>{if(!timer)timer=setInterval(()=>show((cur+1)%3),3200);});
window.addEventListener('resize',()=>{const j=cur;cur=-1;show(j);});
setTimeout(()=>{show(0);timer=setInterval(()=>show((cur+1)%3),3200);},700);
`);
write('equipo', equipo);

console.log('ok →', OUT);

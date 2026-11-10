// Generates the <picture> / <source> demos: node scripts/generate-picture-demos.mjs public/media/html/picture
// - pantallas: pick a screen width and see which source the browser keeps (a different crop each time)
// - formatos: the browser keeps the first format it understands (the weights are approximate)
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
:root{--acc:oklch(0.577 0.245 27.33);--fg:oklch(0.2103 0.0059 285.89);--muted:oklch(0.5517 0.0138 285.94);--line:oklch(90% 0.004 286.32);--soft:oklch(0.97 0.0015 286);--tint:color-mix(in oklab,var(--acc) 12%,white);--mono:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;--code:'SFMono-Regular',ui-monospace,Menlo,Consolas,monospace;--ease:cubic-bezier(.22,1,.36,1)}
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
.code.pick .l.opt{opacity:.32}
.code.pick .l.opt.on{opacity:1;background:var(--tint);border-left-color:var(--acc)}
.t{color:var(--acc)}
`;

// chips + autoplay through the first control until someone clicks
const ENGINE = `
const groups=[...document.querySelectorAll('.ctl')];
let auto=true;
function pick(g,chip){g.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===chip));apply(chip.dataset.v);}
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

const chips = (label, values, on = 0) =>
  `<div class="ctl"><span class="prop">${label}</span>${values
    .map(([v, t], i) => `<button class="chip${i === on ? ' on' : ''}" data-v="${v}">${t}</button>`).join('')}</div>`;

// escape code shown on screen
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const tag = (s) => esc(s).replace(/(&lt;\/?[a-z]+)/g, '<span class="t">$1</span>').replace(/(\/?&gt;)/g, '<span class="t">$1</span>');

/* ------------------------------------------------- the lighthouse "photo" (one drawing, three crops) */

const SCENE = `<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2350"/><stop offset=".55" stop-color="#d9566b"/><stop offset="1" stop-color="#f7b267"/></linearGradient>
<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d3a6b"/><stop offset="1" stop-color="#1a1838"/></linearGradient>
</defs>
<rect width="600" height="300" fill="url(#sky)"/>
<circle cx="150" cy="196" r="34" fill="#ffd58a"/>
<rect y="200" width="600" height="100" fill="url(#sea)"/>
<g fill="#ffd58a" opacity=".55"><rect x="112" y="212" width="76" height="3" rx="1.5"/><rect x="124" y="224" width="52" height="3" rx="1.5"/><rect x="136" y="236" width="28" height="3" rx="1.5"/></g>
<path d="M300 300 L330 222 Q380 196 430 206 L520 224 Q570 236 600 232 L600 300 Z" fill="#141228"/>
<g transform="translate(392 92)">
<path d="M-12 118 L-7 20 L7 20 L12 118 Z" fill="#f3efe8"/>
<path d="M-11 92 L11 92 L11.6 104 L-11.6 104 Z M-9 56 L9 56 L9.6 68 L-9.6 68 Z" fill="#c8384c"/>
<rect x="-10" y="8" width="20" height="13" rx="2" fill="#ffe7a8"/>
<path d="M-12 8 L0 -6 L12 8 Z" fill="#c8384c"/>
<path d="M10 14 L120 -4 L120 32 Z" fill="#ffe7a8" opacity=".28"/>
</g>
<g fill="none" stroke="#1a1838" stroke-width="2" stroke-linecap="round"><path d="M250 70 q6 -6 12 0 q6 -6 12 0"/><path d="M286 52 q5 -5 10 0 q5 -5 10 0"/></g>`;

/* ------------------------------------------------- pantallas */

const PICTURE = [
  ['<picture>', ''],
  ['  <source', 'grande'], ['    srcset="faro-grande.jpg"', 'grande'], ['    media="(min-width: 1024px)">', 'grande'],
  ['  <source', 'mediano'], ['    srcset="faro-mediano.jpg"', 'mediano'], ['    media="(min-width: 600px)">', 'mediano'],
  ['  <img src="faro-pequeno.jpg" alt="…">', 'pequeno'],
  ['</picture>', ''],
];

write('pantallas', page('<picture>', `
.screen{height:214px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px}
.scr{background:var(--fg);padding:4px;border-radius:9px;transition:width .6s var(--ease)}
.scr .pg{background:#fff;border-radius:5px;padding:5px;display:flex;flex-direction:column;gap:5px}
.pg .bar{height:7px;border-radius:3px;background:var(--line)}
.ph{position:relative;border-radius:3px;overflow:hidden;transition:height .6s var(--ease)}
.ph svg{position:absolute;inset:0;width:100%;height:100%;transition:opacity .35s}
.labels{display:flex;flex-direction:column;align-items:center;gap:2px}
`, `<div class="card">
${chips('Ancho de pantalla:', [['360', '360px'], ['768', '768px'], ['1280', '1280px']])}
<div class="split">
<div class="screen"><div class="scr" id="scr"><div class="pg"><div class="bar"></div><div class="ph" id="ph"></div></div></div><div class="labels"><span class="lbl" id="w"></span><span class="lbl" id="f"></span></div></div>
<div class="code pick">${PICTURE.map(([l, k]) => `<span class="l${k ? ' opt' : ''}"${k ? ` data-k="${k}"` : ''}>${tag(l)}</span>`).join('')}</div>
</div>
</div>`, `
const SCENE=${JSON.stringify(SCENE)};
// one drawing, three crops: panoramic, square, vertical
const CROP={grande:{vb:'0 0 600 300',w:216,file:'faro-grande.jpg'},mediano:{vb:'210 0 300 300',w:128,file:'faro-mediano.jpg'},pequeno:{vb:'330 40 125 250',w:72,file:'faro-pequeno.jpg'}};
const scr=document.getElementById('scr'),ph=document.getElementById('ph'),wl=document.getElementById('w'),fl=document.getElementById('f');
const lines=[...document.querySelectorAll('.l.opt')];
function apply(v){
  const w=+v,k=w>=1024?'grande':w>=600?'mediano':'pequeno',c=CROP[k];
  const [, , vw, vh]=c.vb.split(' ').map(Number);
  scr.style.width=(c.w+18)+'px';
  ph.style.height=Math.round(c.w*vh/vw)+'px';
  const old=ph.querySelector('svg');
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox',c.vb);svg.setAttribute('preserveAspectRatio','xMidYMid slice');svg.innerHTML=SCENE;svg.style.opacity=0;
  ph.appendChild(svg);requestAnimationFrame(()=>{svg.style.opacity=1;if(old){old.style.opacity=0;setTimeout(()=>old.remove(),400);}});
  lines.forEach(l=>l.classList.toggle('on',l.dataset.k===k));
  wl.innerHTML='pantalla · <b>'+w+'px</b>';
  fl.innerHTML='se carga <b>'+c.file+'</b>';
}`));

/* ------------------------------------------------- formatos */

const FORMATOS = [
  ['avif', 'foto.avif', 'image/avif', 90],
  ['webp', 'foto.webp', 'image/webp', 140],
  ['jpg', 'foto.jpg', 'img', 320],
];

write('formatos', page('Formatos', `
.files{display:flex;flex-direction:column;gap:8px}
.file{display:grid;grid-template-columns:36px 128px 1fr 56px;align-items:center;gap:14px;padding:10px 14px;border-radius:12px;border:1px solid var(--line);background:#fff;transition:opacity .35s,background .35s,border-color .35s}
.file .ic{width:36px;height:36px;border-radius:8px;background:var(--soft);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);transition:background .35s,color .35s,border-color .35s}
.file .nm{display:flex;flex-direction:column;gap:2px;min-width:0}
.file .nm b{font-family:var(--code);font-size:12.5px;font-weight:500}
.file .nm small{font-family:var(--code);font-size:10.5px;color:var(--muted)}
.file .bar{height:8px;border-radius:4px;background:var(--soft);overflow:hidden}
.file .bar i{display:block;height:100%;border-radius:4px;background:oklch(80% 0.006 286);transition:background .35s}
.file .kb{font-size:12px;font-weight:600;text-align:right;font-variant-numeric:tabular-nums}
.file.skip{opacity:.35}
.file.skip .nm b{text-decoration:line-through}
.file.on{background:var(--tint);border-color:var(--acc)}
.file.on .ic{background:var(--acc);border-color:var(--acc);color:#fff}
.file.on .bar i{background:var(--acc)}
.file.rest{opacity:.55}
`, `<div class="card">
${chips('El navegador entiende:', [['avif', 'AVIF'], ['webp', 'WebP'], ['jpg', 'solo JPG']])}
<div class="files">${FORMATOS.map(([k, n, t, kb]) => `<div class="file" data-k="${k}"><span class="ic">${k}</span><span class="nm"><b>${n}</b><small>${t === 'img' ? '&lt;img&gt;' : `type="${t}"`}</small></span><span class="bar"><i style="width:${Math.round(kb / 320 * 100)}%"></i></span><span class="kb">${kb} KB</span></div>`).join('')}</div>
</div>`, `
const ORDER=['avif','webp','jpg'];
const files=[...document.querySelectorAll('.file')];
function apply(v){
  const i=ORDER.indexOf(v);
  files.forEach((f,j)=>{f.classList.toggle('skip',j<i);f.classList.toggle('on',j===i);f.classList.toggle('rest',j>i);});
}`));

console.log('ok');

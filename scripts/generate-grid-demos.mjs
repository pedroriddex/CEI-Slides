// Generates the Grid playground demos: node scripts/generate-grid-demos.mjs public/media/css/grid
import fs from 'node:fs'; import path from 'node:path';
const OUT = process.argv[2];

const BASE = `*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%}
body{overflow:hidden;background:oklch(0.9524 0.0013 286.37);color:oklch(0.2103 0.0059 285.89);display:flex;align-items:center;justify-content:center;padding:10px clamp(12px,4vw,32px);font-family:Inter,ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased}
:root{--acc:oklch(0.6204 0.195 253.83);--fg:oklch(0.2103 0.0059 285.89);--muted:oklch(0.5517 0.0138 285.94);--line:oklch(90% 0.004 286.32);--mono:'SFMono-Regular',ui-monospace,Menlo,Consolas,monospace}
.card{width:100%;max-width:540px;max-height:100%;background:#fff;border:1px solid var(--line);border-radius:16px;box-shadow:0 2px 4px 0 rgba(0,0,0,.04),0 1px 2px 0 rgba(0,0,0,.06),0 0 1px 0 rgba(0,0,0,.06);padding:18px;display:flex;flex-direction:column;gap:14px;opacity:0;transform:translateY(6px);animation:in .45s cubic-bezier(.22,1,.36,1) .05s forwards}
@keyframes in{to{opacity:1;transform:none}}
.controls{display:flex;flex-direction:column;gap:8px;flex-shrink:0}
.ctl{display:flex;align-items:center;flex-wrap:wrap;gap:5px}
.prop{font-family:var(--mono);font-size:11px;color:var(--muted);margin-right:4px}
.chip{font-family:var(--mono);font-size:11px;line-height:1;padding:6px 9px;border-radius:999px;border:1px solid var(--line);background:#fff;color:var(--fg);cursor:pointer;transition:background .2s,color .2s,border-color .2s}
.chip:hover{border-color:oklch(80% 0.006 286)}
.chip.on{background:var(--fg);border-color:var(--fg);color:#fff}
.stage{position:relative;border-radius:12px;background:oklch(0.97 0.0015 286);outline:1px dashed oklch(82% 0.008 286);outline-offset:-1px;padding:10px;overflow:hidden}
.it{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;border-radius:9px;font-family:var(--mono);font-size:12px;font-weight:600;color:var(--fg);min-width:36px;min-height:32px}
.it span{display:block;white-space:nowrap}
.it.hl{background:var(--acc)!important;color:#fff}
.cells{position:absolute;inset:10px;display:grid;pointer-events:none}
.cells i{border:1px dashed oklch(78% 0.01 286);border-radius:9px}
`;

const ENGINE = `
const stage=document.getElementById('stage');
const items=[...stage.querySelectorAll(':scope > .it')];
const hl=stage.querySelector('.hl');
const groups=[...document.querySelectorAll('.ctl')];
function apply(g,chip,animate){
  const before=animate?items.map(el=>el.getBoundingClientRect()):null;
  const t=g.dataset.target;
  if(t==='body')document.body.dataset[g.dataset.prop]=chip.dataset.v;
  else (t==='hl'?hl:stage).style.setProperty(g.dataset.prop,chip.dataset.v);
  g.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===chip));
  if(!animate)return;
  items.forEach((el,i)=>{
    const a=before[i],b=el.getBoundingClientRect();
    if(!b.width||!a.width)return;
    const dx=a.left-b.left,dy=a.top-b.top,sx=a.width/b.width,sy=a.height/b.height;
    if(Math.abs(dx)<.5&&Math.abs(dy)<.5&&Math.abs(sx-1)<.01&&Math.abs(sy-1)<.01)return;
    const o={duration:520,easing:'cubic-bezier(.22,1,.36,1)'};
    el.animate([{transformOrigin:'0 0',transform:'translate('+dx+'px,'+dy+'px) scale('+sx+','+sy+')'},{transformOrigin:'0 0',transform:'none'}],o);
    const s=el.firstElementChild;if(s)s.animate([{transform:'scale('+(1/sx)+','+(1/sy)+')'},{transform:'none'}],o);
  });
}
groups.forEach(g=>{
  const chips=[...g.querySelectorAll('.chip')];
  apply(g,chips.find(c=>c.classList.contains('on'))||chips[0],false);
  chips.forEach(c=>c.addEventListener('click',()=>{stop();apply(g,c,true);}));
});
let timer=null;const first=groups[0];
function stop(){clearInterval(timer);timer=null;}
if(first){timer=setInterval(()=>{const cs=[...first.querySelectorAll('.chip')];const i=cs.findIndex(c=>c.classList.contains('on'));apply(first,cs[(i+1)%cs.length],true);},2600);}
`;

const tint = (i, n) => `color-mix(in oklab, var(--acc) ${Math.round(16 + (n > 1 ? (i / (n - 1)) * 40 : 0))}%, white)`;
const val = v => (typeof v === 'string' ? { v, label: v } : v);

function page({ title, controls, stageCss, itemCss = '', items, extraCss = '', hlIndex = null, tintAll = true, cells = null }) {
  const n = items.length;
  const its = items.map((it, i) => {
    const cls = 'it' + (i === hlIndex ? ' hl' : '') + (it.cls ? ' ' + it.cls : '');
    const bg = i === hlIndex ? '' : (tintAll ? tint(i, n) : 'color-mix(in oklab, var(--acc) 16%, white)');
    return `<div class="${cls}" style="background:${bg};${it.style || ''}"><span>${it.label}</span></div>`;
  }).join('');
  const cellsHtml = cells ? `<div class="cells" style="grid-template-columns:${cells.cols};grid-template-rows:${cells.rows};gap:${cells.gap}">${'<i></i>'.repeat(cells.n)}</div>` : '';
  const ctls = controls.map(c => {
    const vs = c.values.map(val); const def = c.def ?? vs[0].v;
    return `<div class="ctl" data-prop="${c.prop}" data-target="${c.target || 'stage'}"><span class="prop">${c.label ?? c.prop + ':'}</span>${vs.map(x => `<button class="chip${x.v === def ? ' on' : ''}" data-v="${x.v.replace(/"/g, '&quot;')}">${x.label}</button>`).join('')}</div>`;
  }).join('');
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title>
<style>
${BASE}#stage{${stageCss}}
#stage>.it{${itemCss}}
${extraCss}
</style></head>
<body>
<div class="card">
<div class="controls">${ctls}</div>
<div class="stage" id="stage">${cellsHtml}${its}</div>
</div>
<script>${ENGINE}</script>
</body></html>
`;
}

const nums = n => Array.from({ length: n }, (_, i) => ({ label: String(i + 1) }));

const demos = {
  // Pedro's "Por ejemplo" sequence: empty cells → one element → span 2 → several elements placed
  cuadricula: page({ title: 'grid', controls: [{ prop: 's', target: 'body', label: '', values: [{ v: '0', label: 'celdas' }, { v: '1', label: 'elemento' }, { v: '2', label: 'span 2' }, { v: '3', label: 'ocupación' }] }],
    stageCss: 'display:grid;grid-template-columns:repeat(5,1fr);grid-template-rows:repeat(2,1fr);gap:8px;height:190px',
    cells: { cols: 'repeat(5,1fr)', rows: 'repeat(2,1fr)', gap: '8px', n: 10 },
    itemCss: 'transition:opacity .35s ease',
    items: [{ label: '¡Hola!', cls: 'a' }, ...['b', 'c', 'd', 'e', 'f', 'g'].map(c => ({ label: '', cls: c }))],
    extraCss: `#stage>.it:not(.a){opacity:0}
#stage>.a{grid-column:1;grid-row:1}
body[data-s="0"] #stage>.a{opacity:0}
body[data-s="2"] #stage>.a{grid-column:1 / span 2}
body[data-s="3"] #stage>.it{opacity:1}
body[data-s="3"] #stage>.a{grid-column:1 / span 2;grid-row:1}
body[data-s="3"] #stage>.b{grid-column:3;grid-row:1 / span 2}
body[data-s="3"] #stage>.c{grid-column:4;grid-row:1}
body[data-s="3"] #stage>.d{grid-column:5;grid-row:1}
body[data-s="3"] #stage>.e{grid-column:1;grid-row:2}
body[data-s="3"] #stage>.f{grid-column:2;grid-row:2}
body[data-s="3"] #stage>.g{grid-column:4 / span 2;grid-row:2}` }),
  columnas: page({ title: 'grid-template-columns', controls: [{ prop: 'grid-template-columns', values: ['100px 100px auto', '1fr 1fr 1fr', '1fr 2fr 1fr', 'repeat(4, 1fr)'] }],
    stageCss: 'display:grid;gap:8px;grid-auto-rows:44px;height:170px;align-content:start', items: nums(8) }),
  'auto-filas': page({ title: 'grid-auto-rows', controls: [{ prop: 'grid-auto-rows', values: ['32px', '48px', '64px'] }],
    stageCss: 'display:grid;gap:8px;grid-template-columns:repeat(4,1fr);height:230px;align-content:start', items: nums(10) }),
  areas: page({ title: 'grid-template-areas', controls: [{ prop: 'grid-template-areas', label: 'grid-template-areas:', values: [
      { v: '"header header" "aside main" "footer footer"', label: 'aside izquierda' },
      { v: '"header header" "main aside" "footer footer"', label: 'aside derecha' },
      { v: '"header aside" "main aside" "footer aside"', label: 'aside alto' }] }],
    stageCss: 'display:grid;gap:8px;grid-template-columns:1fr 2fr;grid-template-rows:44px 1fr 36px;height:220px',
    items: ['header', 'aside', 'main', 'footer'].map(a => ({ label: a, style: `grid-area:${a}` })),
    extraCss: '#stage[style*="main aside"]{grid-template-columns:2fr 1fr}#stage[style*="header aside"]{grid-template-columns:2fr 1fr}' }),
  content: page({ title: 'justify-content / align-content', controls: [
      { prop: 'justify-content', values: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'] },
      { prop: 'align-content', values: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'] }],
    stageCss: 'display:grid;gap:8px;grid-template-columns:repeat(3,64px);grid-template-rows:repeat(2,44px);height:220px', items: nums(6) }),
  items: page({ title: 'justify-items / align-items', controls: [
      { prop: 'justify-items', values: ['stretch', 'start', 'center', 'end'] },
      { prop: 'align-items', values: ['stretch', 'start', 'center', 'end'] }],
    stageCss: 'display:grid;gap:8px;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);height:220px',
    cells: { cols: 'repeat(3,1fr)', rows: 'repeat(2,1fr)', gap: '8px', n: 6 }, itemCss: 'min-width:44px;min-height:36px', items: nums(6) }),
  ocupacion: page({ title: 'grid-column / grid-row', controls: [
      { prop: 'grid-column', target: 'hl', values: ['auto', 'span 2', 'span 3', '1 / -1'] },
      { prop: 'grid-row', target: 'hl', values: ['auto', 'span 2', 'span 3'] }],
    stageCss: 'display:grid;gap:8px;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr);grid-auto-flow:dense;height:230px',
    cells: { cols: 'repeat(4,1fr)', rows: 'repeat(4,1fr)', gap: '8px', n: 16 }, items: nums(7), hlIndex: 0, tintAll: false }),
  self: page({ title: 'justify-self / align-self', controls: [
      { prop: 'justify-self', target: 'hl', values: ['stretch', 'start', 'center', 'end'] },
      { prop: 'align-self', target: 'hl', values: ['stretch', 'start', 'center', 'end'] }],
    stageCss: 'display:grid;gap:8px;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);height:220px',
    cells: { cols: 'repeat(3,1fr)', rows: 'repeat(2,1fr)', gap: '8px', n: 6 }, itemCss: 'min-width:44px;min-height:36px', items: nums(6), hlIndex: 1, tintAll: false }),
};

for (const [name, html] of Object.entries(demos)) {
  fs.mkdirSync(path.join(OUT, name), { recursive: true });
  fs.writeFileSync(path.join(OUT, name, 'index.html'), html);
}
console.log(Object.keys(demos).join(' '));

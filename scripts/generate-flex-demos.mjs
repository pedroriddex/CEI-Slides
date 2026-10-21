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
.it{display:flex;align-items:center;justify-content:center;border-radius:9px;font-family:var(--mono);font-size:12px;font-weight:600;color:var(--fg);min-width:40px;min-height:40px}
.it span{display:block}
.it.hl{background:var(--acc)!important;color:#fff}
`;

const ENGINE = `
const stage=document.getElementById('stage');
const items=[...stage.children];
const hl=stage.querySelector('.hl');
const groups=[...document.querySelectorAll('.ctl')];
function apply(g,chip,animate){
  const before=animate?items.map(el=>el.getBoundingClientRect()):null;
  const target=g.dataset.target==='hl'?hl:stage;
  target.style.setProperty(g.dataset.prop,chip.dataset.v);
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
// autoplay the first control until someone clicks
let timer=null;const first=groups[0];
function stop(){clearInterval(timer);timer=null;}
if(first&&!document.body.dataset.noplay){
  timer=setInterval(()=>{const cs=[...first.querySelectorAll('.chip')];const i=cs.findIndex(c=>c.classList.contains('on'));apply(first,cs[(i+1)%cs.length],true);},2400);
}
`;

const tint = (i, n) => `color-mix(in oklab, var(--acc) ${Math.round(16 + (n > 1 ? (i / (n - 1)) * 40 : 0))}%, white)`;

function page({ title, controls, stageCss, itemCss = '', items, extraCss = '', hlIndex = null, tintAll = true }) {
  const n = items.length;
  const its = items.map((it, i) => {
    const cls = 'it' + (i === hlIndex ? ' hl' : '') + (it.cls ? ' ' + it.cls : '');
    const bg = i === hlIndex ? '' : (tintAll ? tint(i, n) : 'color-mix(in oklab, var(--acc) 16%, white)');
    return `<div class="${cls}" style="background:${bg};${it.style || ''}"><span>${it.label}</span></div>`;
  }).join('');
  const ctls = controls.map(c => `<div class="ctl" data-prop="${c.prop}" data-target="${c.target || 'stage'}"><span class="prop">${c.label || c.prop + ':'}</span>${c.values.map(v => `<button class="chip${v === (c.def ?? c.values[0]) ? ' on' : ''}" data-v="${v}">${v}</button>`).join('')}</div>`).join('');
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
<div class="stage" id="stage">${its}</div>
</div>
<script>${ENGINE}</script>
</body></html>
`;
}

const nums = n => Array.from({ length: n }, (_, i) => ({ label: String(i + 1) }));
const DIR2 = { prop: 'flex-direction', values: ['row', 'column'] };

const demos = {
  display: page({ title: 'display', controls: [{ prop: 'display', values: ['block', 'flex'] }],
    stageCss: 'height:200px;gap:8px', itemCss: 'width:auto;height:44px;padding:0 22px;margin-bottom:8px', items: nums(3),
    extraCss: '#stage[style*="flex"]>.it{margin-bottom:0}' }),
  direccion: page({ title: 'flex-direction', controls: [{ prop: 'flex-direction', values: ['row', 'row-reverse', 'column', 'column-reverse'] }],
    stageCss: 'display:flex;gap:8px;height:220px', itemCss: 'flex:0 0 auto;width:56px;height:44px', items: nums(4) }),
  wrap: page({ title: 'flex-wrap', controls: [{ prop: 'flex-wrap', values: ['nowrap', 'wrap', 'wrap-reverse'] }],
    stageCss: 'display:flex;gap:8px;height:170px;align-content:flex-start', itemCss: 'flex:0 1 76px;min-width:0;height:44px', items: nums(9),
    extraCss: '#stage[style*="wrap-reverse"]{align-content:flex-start}' }),
  gap: page({ title: 'gap', controls: [{ prop: 'gap', values: ['0', '8px', '16px', '32px'], def: '0' }],
    stageCss: 'display:flex;height:120px;align-items:center', itemCss: 'flex:0 0 56px;height:56px', items: nums(4) }),
  'justify-content': page({ title: 'justify-content', controls: [{ prop: 'justify-content', values: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'] }, DIR2],
    stageCss: 'display:flex;gap:8px;height:220px', itemCss: 'flex:0 0 auto;width:50px;height:44px', items: nums(3) }),
  'align-items': page({ title: 'align-items', controls: [{ prop: 'align-items', values: ['stretch', 'start', 'center', 'end', 'baseline'] }, DIR2],
    stageCss: 'display:flex;gap:6px;height:230px', itemCss: 'flex:0 0 auto;align-items:flex-start;padding:6px 14px;min-height:0',
    items: [{ label: '1', style: 'font-size:12px' }, { label: '2', style: 'font-size:20px;padding-top:14px' }, { label: '3', style: 'font-size:14px;padding-bottom:20px' }, { label: '4', style: 'font-size:12px' }] }),
  'align-content': page({ title: 'align-content', controls: [{ prop: 'align-content', values: ['stretch', 'start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'] }],
    stageCss: 'display:flex;flex-wrap:wrap;gap:8px;height:230px', itemCss: 'flex:0 0 calc((100% - 24px) / 4);min-height:36px', items: nums(7) }),
  orden: page({ title: 'order', controls: [{ prop: 'order', target: 'hl', values: ['0', '1', '-1'] }],
    stageCss: 'display:flex;gap:8px;height:120px;align-items:center', itemCss: 'flex:0 0 60px;height:56px', items: nums(4), hlIndex: 2, tintAll: false }),
  grow: page({ title: 'flex-grow', controls: [{ prop: 'flex-grow', target: 'hl', values: ['0', '1', '2'] }],
    stageCss: 'display:flex;gap:8px;height:120px;align-items:center', itemCss: 'flex:1 1 56px;height:56px', items: nums(3), hlIndex: 1, tintAll: false,
    extraCss: '#stage>.hl{flex-grow:0}' }),
  shrink: page({ title: 'flex-shrink', controls: [{ prop: 'flex-shrink', target: 'hl', values: ['1', '0', '3'] }],
    stageCss: 'display:flex;gap:8px;height:120px;align-items:center', itemCss: 'flex:0 1 230px;min-width:0;height:56px', items: nums(3), hlIndex: 1, tintAll: false }),
  basis: page({ title: 'flex-basis', controls: [{ prop: 'flex-basis', target: 'hl', values: ['auto', '100px', '200px'] }],
    stageCss: 'display:flex;gap:8px;height:120px;align-items:center', itemCss: 'flex:0 0 auto;width:56px;height:56px', items: nums(3), hlIndex: 1, tintAll: false }),
  'align-self': page({ title: 'align-self', controls: [{ prop: 'align-self', target: 'hl', values: ['auto', 'center', 'end', 'stretch'] }],
    stageCss: 'display:flex;gap:8px;height:200px;align-items:flex-start', itemCss: 'flex:0 0 60px;height:56px', items: nums(4), hlIndex: 2, tintAll: false,
    extraCss: '#stage>.hl[style*="stretch"]{height:auto}' }),
};

// axes demo: arrows instead of chips' effect on items
demos.ejes = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>ejes</title>
<style>
${BASE}
.wrapax{position:relative;padding:30px 0 0 30px;display:flex;flex-direction:column;min-height:0}
#stage{display:flex;gap:8px;height:190px;transition:none}
#stage>.it{flex:0 0 auto;width:56px;height:44px}
.ax{position:absolute;display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:11px;white-space:nowrap}
.ax i{display:block;position:relative;background:currentColor}
.ax i::after{content:'';position:absolute;border:5px solid transparent}
.main{color:var(--acc);font-weight:600}
.cross{color:var(--muted)}
/* row: main = horizontal on top, cross = vertical on the left */
body[data-d=row] .main{top:6px;left:30px;right:0;flex-direction:row}
body[data-d=row] .main i{flex:1;height:2px}
body[data-d=row] .main i::after{right:-6px;top:-4px;border-left-color:currentColor}
body[data-d=row] .cross{top:30px;bottom:0;left:6px;flex-direction:column}
body[data-d=row] .cross i{flex:1;width:2px}
body[data-d=row] .cross i::after{bottom:-6px;left:-4px;border-top-color:currentColor}
body[data-d=row] .cross span,body[data-d=column] .main span{writing-mode:vertical-rl}
/* column: swapped */
body[data-d=column] .cross{top:6px;left:30px;right:0;flex-direction:row}
body[data-d=column] .cross i{flex:1;height:2px}
body[data-d=column] .cross i::after{right:-6px;top:-4px;border-left-color:currentColor}
body[data-d=column] .main{top:30px;bottom:0;left:6px;flex-direction:column}
body[data-d=column] .main i{flex:1;width:2px}
body[data-d=column] .main i::after{bottom:-6px;left:-4px;border-top-color:currentColor}
</style></head>
<body data-d="row">
<div class="card">
<div class="controls"><div class="ctl" data-prop="flex-direction" data-target="stage"><span class="prop">flex-direction:</span><button class="chip on" data-v="row">row</button><button class="chip" data-v="column">column</button></div></div>
<div class="wrapax">
<div class="ax main"><span>eje principal</span><i></i></div>
<div class="ax cross"><span>eje secundario</span><i></i></div>
<div class="stage" id="stage">${nums(3).map((it, i) => `<div class="it" style="background:${tint(i, 3)}"><span>${it.label}</span></div>`).join('')}</div>
</div>
</div>
<script>${ENGINE}
document.querySelectorAll('.chip').forEach(c=>{const f=()=>document.body.dataset.d=c.dataset.v;c.addEventListener('click',f);new MutationObserver(()=>c.classList.contains('on')&&f()).observe(c,{attributes:true});});
</script>
</body></html>
`;

for (const [name, html] of Object.entries(demos)) {
  fs.mkdirSync(path.join(OUT, name), { recursive: true });
  fs.writeFileSync(path.join(OUT, name, 'index.html'), html);
}
console.log(Object.keys(demos).join(' '));

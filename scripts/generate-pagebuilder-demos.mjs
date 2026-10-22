// Generates the "Page builders" demos: node scripts/generate-pagebuilder-demos.mjs public/media/elementor/page-builders
// Generic (not tied to any product) visual explanations of what a page builder is.
import fs from 'node:fs'; import path from 'node:path';
const OUT = process.argv[2];

const BASE = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%}
body{overflow:hidden;background:oklch(0.9524 0.0013 286.37);color:oklch(0.2103 0.0059 285.89);display:flex;align-items:center;justify-content:center;padding:6px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased}
:root{--acc:oklch(0.6204 0.195 253.83);--fg:oklch(0.2103 0.0059 285.89);--muted:oklch(0.5517 0.0138 285.94);--line:oklch(90% 0.004 286.32);--soft:oklch(0.97 0.0015 286);--mono:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;--code:'SFMono-Regular',ui-monospace,Menlo,Consolas,monospace}
.card{width:100%;height:100%;background:#fff;border:1px solid var(--line);border-radius:16px;box-shadow:0 2px 4px 0 rgba(0,0,0,.04),0 1px 2px 0 rgba(0,0,0,.06),0 0 1px 0 rgba(0,0,0,.06);padding:16px;display:flex;flex-direction:column;gap:14px;opacity:0;transform:translateY(6px);animation:in .45s cubic-bezier(.22,1,.36,1) .05s forwards}
@keyframes in{to{opacity:1;transform:none}}
.ctl{display:flex;flex-wrap:wrap;gap:6px;flex:none}
.chip{font-family:var(--mono);font-size:12.5px;font-weight:500;line-height:1;padding:7px 12px;border-radius:999px;border:1px solid var(--line);background:#fff;color:var(--fg);cursor:pointer;transition:background .2s,color .2s}
.chip.on{background:var(--fg);border-color:var(--fg);color:#fff}
.stage{position:relative;flex:1;min-height:0;border-radius:10px;overflow:hidden;outline:1px solid var(--line);background:var(--soft)}
.cap{flex:none;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;padding:0 4px 2px;min-height:18px;transition:opacity .2s}
.cap.swap{opacity:0}
.cap .n{font-size:14px;font-weight:600;letter-spacing:-.005em}
.cap .t{font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--acc)}
.cap .d{font-size:13px;font-weight:500;color:var(--muted)}
/* the sample hero used in several demos */
.hero{display:flex;flex-direction:column;align-items:flex-start;gap:10px}
.hero h1{font-size:26px;font-weight:700;letter-spacing:-.02em;line-height:1.1}
.hero p{font-size:12.5px;color:var(--muted);line-height:1.5;max-width:300px}
.hero .b{display:inline-block;padding:8px 16px;border-radius:999px;background:var(--acc);color:#fff;font-size:12px;font-weight:600}
.ph{border-radius:10px;background:linear-gradient(135deg,color-mix(in oklab,var(--acc) 35%,white),color-mix(in oklab,var(--acc) 75%,#1b1b3a))}
`;

const CHIPS_JS = `
const chips=[...document.querySelectorAll('.chip')];
let timer=null;
function pick(c){chips.forEach(x=>x.classList.toggle('on',x===c));onSelect(c.dataset.v);}
chips.forEach(c=>c.addEventListener('click',()=>{clearInterval(timer);pick(c);}));
pick(chips[0]);
timer=setInterval(()=>{const i=chips.findIndex(c=>c.classList.contains('on'));pick(chips[(i+1)%chips.length]);},AUTOPLAY_MS);
`;
const CAPTION_JS = `
function caption(n,t,d){const c=document.getElementById('cap');c.classList.add('swap');setTimeout(()=>{document.getElementById('cn').textContent=n;document.getElementById('ct').textContent=t;document.getElementById('cd').textContent=d;c.classList.remove('swap');},150);}
`;
const CAP = '<div class="cap" id="cap"><span class="n" id="cn"></span><span class="t" id="ct"></span><span class="d" id="cd"></span></div>';

const page = (title, css, body, js) => `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title>
<style>${BASE}${css}</style></head>
<body>${body}<script>${CAPTION_JS}${js}</script></body></html>
`;

/* 1 · sin-con: the same section, written by hand or built visually */
const sinCon = page('Con código o con page builder', `
.mode{position:absolute;inset:0;display:flex;opacity:0;transition:opacity .45s ease;pointer-events:none}
.mode.on{opacity:1;pointer-events:auto}
.code{flex:1;background:#16161b;color:#d4d4d8;font-family:var(--code);font-size:11.5px;line-height:1.65;padding:16px 18px;overflow:hidden}
.code .k{color:#7aa2f7}.code .a{color:#bb9af7}.code .s{color:#9ece6a}.code .c{color:#6b6b78}
.mini{width:42%;background:#fff;border-left:1px solid #2a2a33;padding:18px;display:flex;align-items:center}
.mini .hero h1{font-size:18px}
.vis{flex:1;display:grid;grid-template-columns:1fr 150px}
.canvas{position:relative;background:#fff;padding:28px 26px;display:flex;align-items:center}
.sel{position:relative;outline:2px solid var(--acc);outline-offset:6px;border-radius:2px}
.sel::before{content:'Título';position:absolute;left:-8px;top:-28px;background:var(--acc);color:#fff;font-family:var(--mono);font-size:9.5px;padding:2px 7px;border-radius:4px 4px 0 0}
.panel{background:var(--soft);border-left:1px solid var(--line);padding:12px;display:flex;flex-direction:column;gap:8px}
.panel .lab{font-family:var(--mono);font-size:9.5px;color:var(--muted)}
.panel .in{height:26px;border:1px solid var(--line);border-radius:6px;background:#fff;font-size:11px;display:flex;align-items:center;padding:0 7px}
.panel .sw{display:flex;gap:5px}
.panel .sw i{width:18px;height:18px;border-radius:5px}
.cursor{position:absolute;width:16px;height:16px;left:58%;top:30%;animation:mv 3s ease-in-out infinite}
.cursor svg{width:16px;height:16px}
@keyframes mv{0%,100%{transform:translate(0,0)}50%{transform:translate(-60px,20px)}}
`, `
<div class="card">
  <div class="ctl"><button class="chip" data-v="code">con código</button><button class="chip" data-v="vis">con page builder</button></div>
  <div class="stage">
    <div class="mode" id="m-code">
      <div class="code"><span class="c">&lt;!-- HTML --&gt;</span><br>&lt;<span class="k">section</span> <span class="a">class</span>=<span class="s">"hero"</span>&gt;<br>&nbsp;&nbsp;&lt;<span class="k">h1</span>&gt;Diseño web a medida&lt;/<span class="k">h1</span>&gt;<br>&nbsp;&nbsp;&lt;<span class="k">p</span>&gt;Webs rápidas y bonitas.&lt;/<span class="k">p</span>&gt;<br>&nbsp;&nbsp;&lt;<span class="k">a</span> <span class="a">class</span>=<span class="s">"b"</span>&gt;Contactar&lt;/<span class="k">a</span>&gt;<br>&lt;/<span class="k">section</span>&gt;<br><br><span class="c">/* CSS */</span><br>.<span class="a">hero</span> { <span class="k">display</span>: flex; <span class="k">gap</span>: 10px; }<br>.<span class="a">b</span> { <span class="k">background</span>: <span class="s">#3858e9</span>;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="k">border-radius</span>: 999px; }</div>
      <div class="mini"><div class="hero"><h1>Diseño web a medida</h1><p>Webs rápidas y bonitas.</p><span class="b">Contactar</span></div></div>
    </div>
    <div class="mode" id="m-vis">
      <div class="vis">
        <div class="canvas"><div class="hero"><h1 class="sel">Diseño web a medida</h1><p>Webs rápidas y bonitas.</p><span class="b">Contactar</span></div>
          <span class="cursor"><svg viewBox="0 0 16 16"><path d="M2 1l11 6-5 1.5L6 14z" fill="#111" stroke="#fff" stroke-width="1"/></svg></span></div>
        <div class="panel"><span class="lab">Texto</span><span class="in">Diseño web a medida</span><span class="lab">Tamaño</span><span class="in">26 px</span><span class="lab">Color</span><span class="sw"><i style="background:#111"></i><i style="background:var(--acc)"></i><i style="background:#e5e5ea"></i></span></div>
      </div>
    </div>
  </div>
  ${CAP}
</div>`, `
const AUTOPLAY_MS=3600;
function onSelect(v){
  document.getElementById('m-code').classList.toggle('on',v==='code');
  document.getElementById('m-vis').classList.toggle('on',v==='vis');
  v==='code'?caption('Con código','A mano','Escribimos el código de cada elemento, línea a línea.')
            :caption('Con page builder','Visual','Hacemos clic en el elemento y lo cambiamos desde un panel.');
}` + CHIPS_JS);

/* 2 · estructura: boxes inside boxes */
const estructura = page('Cajas dentro de cajas', `
.pg{position:absolute;inset:24px 16px 14px;background:#fff;border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:10px}
.top{height:22px;border-radius:5px;background:#f1f1f3}
.cont{flex:1;display:grid;grid-template-columns:1.1fr 1fr;gap:12px;padding:14px;border-radius:8px}
.col{display:flex;flex-direction:column;justify-content:center;gap:9px;padding:10px;border-radius:6px}
.w{border-radius:5px}
.w.t{height:24px;width:85%;background:#2a2a33}
.w.p{height:34px;width:95%;background:#e4e4e8}
.w.b{height:24px;width:40%;border-radius:999px;background:var(--acc)}
.w.i{flex:1;min-height:80px;background:linear-gradient(135deg,color-mix(in oklab,var(--acc) 35%,white),color-mix(in oklab,var(--acc) 75%,#1b1b3a))}
[data-l]:not(.pg){position:relative}
[data-l]{transition:outline-color .3s,background-color .3s;outline:2px dashed transparent;outline-offset:3px}
[data-l]::after{content:attr(data-name);position:absolute;left:-3px;top:-19px;font-family:var(--mono);font-size:9px;font-weight:600;color:#fff;background:var(--acc);padding:2px 6px;border-radius:4px;opacity:0;transition:opacity .3s;white-space:nowrap;z-index:2}
body[data-v=page] [data-l=page],body[data-v=cont] [data-l=cont],body[data-v=col] [data-l=col],body[data-v=wid] [data-l=wid]{outline-color:var(--acc)}
body[data-v=cont] [data-l=cont],body[data-v=col] [data-l=col]{background-color:color-mix(in oklab,var(--acc) 8%,transparent)}
body[data-v=page] [data-l=page]::after,body[data-v=cont] [data-l=cont]::after,body[data-v=col] [data-l=col]::after,body[data-v=wid] [data-l=wid]::after{opacity:1}
`, `
<div class="card">
  <div class="ctl"><button class="chip" data-v="page">página</button><button class="chip" data-v="cont">contenedor</button><button class="chip" data-v="col">columnas</button><button class="chip" data-v="wid">widgets</button></div>
  <div class="stage">
    <div class="pg" data-l="page" data-name="Página">
      <div class="top"></div>
      <div class="cont" data-l="cont" data-name="Contenedor">
        <div class="col" data-l="col" data-name="Columna 1"><div class="w t" data-l="wid" data-name="Título"></div><div class="w p" data-l="wid" data-name="Texto"></div><div class="w b" data-l="wid" data-name="Botón"></div></div>
        <div class="col" data-l="col" data-name="Columna 2"><div class="w i" data-l="wid" data-name="Imagen"></div></div>
      </div>
    </div>
  </div>
  ${CAP}
</div>`, `
const AUTOPLAY_MS=2800;
const T={page:['Página','El lienzo','Todo lo que construimos va dentro.'],cont:['Contenedor','La sección','Agrupa un bloque de la página, de lado a lado.'],col:['Columnas','El reparto','Dividen el contenedor en partes.'],wid:['Widgets','Las piezas','Título, texto, botón, imagen… lo que se ve.']};
function onSelect(v){document.body.dataset.v=v;caption(...T[v]);}` + CHIPS_JS);

/* 3 · editor: drag a widget into the page */
const editor = page('Arrastrar y soltar', `
.ed{position:absolute;inset:0;display:grid;grid-template-columns:150px 1fr;grid-template-rows:30px 1fr}
.tb{grid-column:1 / 3;display:flex;align-items:center;gap:8px;padding:0 10px;background:#fff;border-bottom:1px solid var(--line)}
.tb .lg{width:16px;height:16px;border-radius:4px;background:var(--fg)}
.tb .dv{display:flex;gap:4px;margin-left:auto}
.tb .dv i{width:16px;height:12px;border:1.5px solid var(--muted);border-radius:2px}
.tb .dv i:nth-child(2){width:11px}.tb .dv i:nth-child(3){width:7px}
.tb .pub{margin-left:10px;font-size:10px;font-weight:600;color:#fff;background:var(--acc);padding:4px 10px;border-radius:5px}
.side{background:#fff;border-right:1px solid var(--line);padding:9px;display:flex;flex-direction:column;gap:7px;overflow:hidden}
.side .s{height:22px;border:1px solid var(--line);border-radius:6px;font-size:10px;color:var(--muted);display:flex;align-items:center;padding:0 7px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.wg{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;height:46px;border:1px solid var(--line);border-radius:7px;font-size:9.5px;color:var(--fg);background:#fff;transition:outline-color .3s;outline:2px solid transparent;outline-offset:1px}
.wg b{width:16px;height:10px;border-radius:3px;background:#d4d4d8}
.wg.btn b{border-radius:999px;background:var(--acc)}
.settings{display:none;flex-direction:column;gap:7px}
.settings .tabs{display:flex;gap:4px}
.settings .tabs span{flex:1;text-align:center;font-size:9px;padding:4px 0;border-radius:5px;background:var(--soft);color:var(--muted)}
.settings .tabs span.on{background:var(--fg);color:#fff}
.settings .lab{font-family:var(--mono);font-size:9px;color:var(--muted)}
.settings .in{height:22px;border:1px solid var(--line);border-radius:6px;background:#fff;font-size:10px;display:flex;align-items:center;padding:0 7px}
.cv{position:relative;padding:18px;overflow:hidden}
.sec{background:#fff;border-radius:8px;padding:20px 22px;display:flex;flex-direction:column;gap:10px;min-height:100%}
.sec h1{font-size:22px;font-weight:700;letter-spacing:-.02em}
.sec p{font-size:11.5px;color:var(--muted);max-width:320px;line-height:1.5}
.drop{height:38px;border:2px dashed #d4d4d8;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--muted);transition:all .3s}
.drop .b{display:none;padding:7px 16px;border-radius:999px;background:var(--acc);color:#fff;font-size:11px;font-weight:600}
.ghost{position:absolute;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;width:64px;height:46px;border-radius:7px;background:#fff;border:1px solid var(--acc);box-shadow:0 8px 20px rgba(0,0,0,.18);font-size:9.5px;opacity:0;pointer-events:none}
.ghost b{width:16px;height:10px;border-radius:999px;background:var(--acc)}
/* steps */
body[data-s="1"] .wg.btn,body[data-s="2"] .wg.btn{outline-color:var(--acc)}
body[data-s="2"] .drop{border-color:var(--acc);background:color-mix(in oklab,var(--acc) 8%,white)}
body[data-s="3"] .drop,body[data-s="4"] .drop{border-color:transparent;justify-content:flex-start;height:auto}
body[data-s="3"] .drop span,body[data-s="4"] .drop span{display:none}
body[data-s="3"] .drop .b,body[data-s="4"] .drop .b{display:inline-block}
body[data-s="4"] .drop .b{outline:2px solid var(--acc);outline-offset:4px}
body[data-s="4"] .widgets{display:none}
body[data-s="4"] .settings{display:flex}
`, `
<div class="card">
  <div class="stage">
    <div class="ed">
      <div class="tb"><span class="lg"></span><span class="dv"><i></i><i></i><i></i></span><span class="pub">Publicar</span></div>
      <div class="side">
        <div class="widgets"><div class="s">Buscar widget…</div><div class="grid" style="margin-top:7px">
          <div class="wg"><b></b>Título</div><div class="wg"><b></b>Texto</div><div class="wg"><b></b>Imagen</div><div class="wg btn" id="src"><b></b>Botón</div>
          <div class="wg"><b></b>Vídeo</div><div class="wg"><b></b>Icono</div><div class="wg"><b></b>Formulario</div><div class="wg"><b></b>Espacio</div></div></div>
        <div class="settings"><div class="tabs"><span class="on">Contenido</span><span>Estilo</span><span>Avanzado</span></div>
          <span class="lab">Texto</span><span class="in">Contactar</span><span class="lab">Enlace</span><span class="in">/contacto</span><span class="lab">Alineación</span><span class="in">Izquierda</span></div>
      </div>
      <div class="cv"><div class="sec"><h1>Diseño web a medida</h1><p>Webs rápidas, bonitas y fáciles de gestionar.</p><div class="drop" id="dst"><span>Arrastra aquí un widget</span><span class="b">Contactar</span></div></div></div>
    </div>
    <div class="ghost" id="ghost"><b></b>Botón</div>
  </div>
  ${CAP}
</div>`, `
const STEPS=[
 ['1','Panel de widgets','Las piezas','Elegimos el widget que queremos añadir.',1800],
 ['2','Arrastrar','Drag','Lo llevamos a la página…',1600],
 ['3','Soltar','Drop','…y aparece justo donde lo soltamos.',1500],
 ['4','Ajustes','Contenido · Estilo · Avanzado','Al seleccionarlo, el panel muestra sus opciones.',2600]];
const ghost=document.getElementById('ghost'),stage=document.querySelector('.stage');
function pos(el){const a=stage.getBoundingClientRect(),r=el.getBoundingClientRect();return{x:r.left-a.left,y:r.top-a.top,w:r.width,h:r.height};}
let i=0;
function run(){
  const [s,n,t,d,ms]=STEPS[i];document.body.dataset.s=s;caption(n,t,d);
  if(s==='2'){const a=pos(document.getElementById('src')),b=pos(document.getElementById('dst'));
    ghost.animate([{left:a.x+'px',top:a.y+'px',opacity:0},{left:a.x+'px',top:a.y+'px',opacity:1,offset:.15},{left:(b.x+20)+'px',top:(b.y-4)+'px',opacity:1}],{duration:1400,easing:'cubic-bezier(.65,0,.35,1)',fill:'forwards'});}
  if(s==='3'){ghost.animate([{opacity:1},{opacity:0}],{duration:200,fill:'forwards'});}
  i=(i+1)%STEPS.length;setTimeout(run,ms);
}
(document.fonts?document.fonts.ready:Promise.resolve()).then(run);
`);

/* 4 · dispositivos: one design, three screens */
const dispositivos = page('Responsive', `
.wrapd{position:absolute;inset:0;display:flex;align-items:flex-start;justify-content:center;padding:14px}
.dev{width:100%;height:100%;background:#fff;border-radius:10px;border:6px solid #2a2a33;overflow:hidden;transition:width .6s cubic-bezier(.65,0,.35,1),border-radius .6s;padding:14px;display:flex;flex-direction:column;gap:10px}
.dev .hero h1{transition:font-size .6s}
.cards{display:flex;flex-wrap:wrap;gap:8px}
.cards div{flex:1 1 140px;min-height:44px;border-radius:7px;background:var(--soft);border:1px solid var(--line);display:flex;align-items:flex-end;padding:7px;font-size:10px;color:var(--muted)}
body[data-v=tab] .dev{width:68%}
body[data-v=mob] .dev{width:36%;border-radius:18px}
body[data-v=mob] .dev .hero h1{font-size:18px}
body[data-v=mob] .cards div{flex-basis:100%}
`, `
<div class="card">
  <div class="ctl"><button class="chip" data-v="desk">ordenador</button><button class="chip" data-v="tab">tableta</button><button class="chip" data-v="mob">móvil</button></div>
  <div class="stage"><div class="wrapd"><div class="dev">
    <div class="hero"><h1>Diseño web a medida</h1><p>Webs rápidas y bonitas.</p><span class="b">Contactar</span></div>
    <div class="cards"><div>Diseño</div><div>Desarrollo</div><div>SEO</div></div>
  </div></div></div>
  ${CAP}
</div>`, `
const AUTOPLAY_MS=3000;
const T={desk:['Ordenador','Escritorio','El diseño completo, con las tarjetas en fila.'],tab:['Tableta','Tablet','Menos ancho: las tarjetas se reparten como pueden.'],mob:['Móvil','Mobile','Todo en una columna y textos más pequeños.']};
function onSelect(v){document.body.dataset.v=v;caption(...T[v]);}` + CHIPS_JS);

/* 5 · bloques vs builder: comparison table */
const tabla = page('Editor de bloques vs page builder', `
.tbl{flex:1;display:grid;grid-template-columns:auto 1fr 1fr;align-content:center;padding:4px 6px}
.cell{padding:11px 12px;font-size:13px;display:flex;align-items:center;border-top:1px solid var(--line);opacity:0;transform:translateY(4px);animation:in .45s cubic-bezier(.22,1,.36,1) forwards}
.head{border-top:0;font-weight:600;font-size:14px}
.key{font-family:var(--mono);font-size:11px;color:var(--muted);padding-right:18px}
.r1{animation-delay:.05s}.r2{animation-delay:.15s}.r3{animation-delay:.25s}.r4{animation-delay:.35s}.r5{animation-delay:.45s}.r6{animation-delay:.55s}
`, `
<div class="card"><div class="tbl">
  <div class="cell head r1"></div><div class="cell head r1">Editor de bloques</div><div class="cell head r1">Page builder</div>
  <div class="cell key r2">viene con WordPress</div><div class="cell r2">Sí</div><div class="cell r2">No, es un plugin</div>
  <div class="cell key r3">libertad de diseño</div><div class="cell r3">Media</div><div class="cell r3">Mucha</div>
  <div class="cell key r4">peso de la página</div><div class="cell r4">Ligero</div><div class="cell r4">Más pesado</div>
  <div class="cell key r5">diseños prediseñados</div><div class="cell r5">Patrones</div><div class="cell r5">Muchas plantillas</div>
  <div class="cell key r6">si lo quitas</div><div class="cell r6">El contenido sigue</div><div class="cell r6">Se pierde el diseño</div>
</div></div>`, '');

const DEMOS = { 'sin-con': sinCon, estructura, editor, dispositivos, 'bloques-vs-builder': tabla };
for (const [name, html] of Object.entries(DEMOS)) {
  fs.mkdirSync(path.join(OUT, name), { recursive: true });
  fs.writeFileSync(path.join(OUT, name, 'index.html'), html);
}
console.log(Object.keys(DEMOS).join(' '));

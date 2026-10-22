// Generates the "Plugins" demos: node scripts/generate-plugins-demos.mjs public/media/wordpress/plugins
// - directorio / ficha: Add Plugins › Popular (real data from WordPress.org, 2026-10-22)
// - instalados: Installed Plugins with three example plugins
// - semaforo: what to check before installing (an invented example plugin)
import fs from 'node:fs'; import path from 'node:path';
import { adminScreen, buildDemo } from './lib/wp-admin-demo.mjs';
const OUT = process.argv[2];
const ICON = s => `../assets/icons/${s}`;

// [slug, icon file, name, description, author, stars, ratings, installs, updated, compatible]
const POPULAR = [
  ['elementor', 'elementor.gif', 'Elementor Website Builder – more than just a page builder', 'The Elementor Website Builder has it all: drag and drop page builder, Atomic Editor, pixel perfect design, global and reusable style systems…', 'Elementor', 4.5, '7,319', '10+ Million', '1 week ago', true],
  ['wordpress-seo', 'wordpress-seo.gif', 'Yoast SEO – Advanced SEO with real-time guidance and built-in AI', 'Real-time SEO guidance, schema, and AI built in. Help search engines and AI systems understand your content.', 'Yoast', 5, '27,820', '10+ Million', '1 week ago', true],
  ['contact-form-7', 'contact-form-7.svg', 'Contact Form 7', 'Just another contact form plugin. Simple but flexible.', 'Rock Lobster Inc.', 4, '2,184', '10+ Million', '23 hours ago', true],
  ['classic-editor', 'classic-editor.png', 'Classic Editor', 'Enables the previous "classic" editor and the old-style Edit Post screen with TinyMCE, Meta Boxes, etc.', 'WordPress.org', 5, '1,249', '8+ Million', '5 months ago', false],
  ['litespeed-cache', 'litespeed-cache.png', 'LiteSpeed Cache', 'All-in-one unbeatable acceleration & PageSpeed improvement: caching, image/CSS/JS optimization…', 'LiteSpeed Technologies', 5, '2,777', '7+ Million', '2 days ago', true],
  ['woocommerce', 'woocommerce.svg', 'WooCommerce', 'Everything you need to launch an online store in days and keep it growing for years.', 'Automattic', 4.5, '4,826', '7+ Million', '2 weeks ago', true],
];

const stars = n => Array.from({ length: 5 }, (_, i) => `<i class="st ${i + 1 <= n ? 'f' : i + 0.5 <= n ? 'h' : ''}">★</i>`).join('');

function pluginCard([slug, icon, name, desc, author, rating, ratings, installs, updated, compatible], z = false) {
  const zz = k => (z ? ` data-z="f-${k}"` : '');
  return `
    <div class="pc"${slug === 'classic-editor' ? ' data-z="d-untested-card"' : ''}${z ? ' data-z="f-card"' : ''}>
      <div class="pt">
        <img class="ic" src="${ICON(icon)}" alt="">
        <div class="pm"><h3${zz('name')}>${name}</h3><p class="pd"${zz('desc')}>${desc}</p><p class="by"${zz('author')}><em>By</em> <a>${author}</a></p></div>
        <ul class="pa"><li><span class="b2"${zz('install')}>Install Now</span></li><li><a${zz('more')}>More Details</a></li></ul>
      </div>
      <div class="pb">
        <div class="l"><span class="rt"${zz('rating')}>${stars(rating)} <span class="nr">(${ratings})</span></span><span class="ai"${zz('installs')}>${installs} Active Installations</span></div>
        <div class="r"><span${zz('updated')}><b>Last Updated:</b> ${updated}</span><span class="cp${compatible ? '' : ' no'}"${zz('compat')}${slug === 'classic-editor' ? ' data-z="d-untested"' : ''}>${compatible ? '<b>Compatible</b> with your version of WordPress' : '<b>Untested</b> with your version of WordPress'}</span></div>
      </div>
    </div>`;
}

const directorioMain = (zoneCard) => `
  <div class="tabs"><span class="tab">Help ▾</span></div>
  <div class="head"><h1>Add Plugins</h1><span class="btn2" data-z="d-upload">Upload Plugin</span></div>
  <div class="filter">
    <ul class="flinks" data-z="d-tabs"><li>Featured</li><li class="cur">Popular</li><li>Recommended</li><li>Favorites</li></ul>
    <span class="srch" data-z="d-search"><span class="sel">Keyword ▾</span><span class="field">Search Plugins…</span></span>
  </div>
  <p class="intro muted">Plugins extend and expand the functionality of WordPress. You may install plugins in the WordPress Plugin Directory right from here.</p>
  <div class="cards">${POPULAR.map((p, i) => pluginCard(p, zoneCard && i === 2)).join('')}</div>`;

const DIR_CSS = `
.head{display:flex;align-items:center;gap:10px;margin:6px 0 14px}
.head h1{margin:0}
.filter{display:flex;align-items:center;justify-content:space-between;background:#fff;border:1px solid #dcdcde;padding:0 12px;height:48px;margin-bottom:10px}
.flinks{list-style:none;display:flex;gap:18px;height:100%}
.flinks li{display:flex;align-items:center;font-size:13px;color:#50575e}
.flinks li.cur{color:#1e1e1e;box-shadow:inset 0 -4px #3858e9;font-weight:500}
.srch{display:flex;gap:6px}
.sel{display:inline-flex;align-items:center;height:30px;padding:0 22px 0 8px;border:1px solid #8c8f94;border-radius:3px;background:#fff}
.field{display:inline-flex;align-items:center;width:200px;height:30px;padding:0 8px;border:1px solid #8c8f94;border-radius:3px;background:#fff;color:#8c8f94}
.intro{margin-bottom:12px;font-size:13px}
.cards{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.pc{background:#fff;border:1px solid #dcdcde;display:flex;flex-direction:column}
.pt{position:relative;display:grid;grid-template-columns:96px 1fr;gap:14px;padding:16px 16px 12px;min-height:150px}
.ic{width:96px;height:96px;border-radius:2px;object-fit:contain}
.pm{padding-right:120px}
.pm h3{font-size:15px;font-weight:600;line-height:1.3;color:#3858e9;margin-bottom:8px}
.pd{font-size:12.5px;line-height:1.5;color:#3c434a;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.by{margin-top:6px;font-size:12.5px;color:#646970}
.by em{font-style:italic}
.by a{text-decoration:none}
.pa{position:absolute;right:16px;top:16px;list-style:none;display:flex;flex-direction:column;align-items:flex-end;gap:8px;font-size:12.5px}
.pa a{text-decoration:none}
.b2{display:inline-block;border:1px solid #3858e9;color:#3858e9;background:#f6f7f7;border-radius:3px;padding:4px 10px;font-size:12.5px}
.pb{display:flex;justify-content:space-between;gap:10px;padding:12px 16px;background:#f6f7f7;border-top:1px solid #dcdcde;font-size:12px;color:#3c434a}
.pb .l,.pb .r{display:flex;flex-direction:column;gap:6px}
.pb .r{text-align:right;align-items:flex-end}
.st{font-style:normal;color:#dcdcde;font-size:14px;letter-spacing:-1px}
.st.f{color:#dba617}
.st.h{background:linear-gradient(90deg,#dba617 50%,#dcdcde 50%);-webkit-background-clip:text;color:transparent}
.nr{color:#646970}
.cp b{color:#008a20}
.cp.no b{color:#1e1e1e}
`;

/* ------------------------------------------------- installed plugins list */

// [name, active, actions, description, version, author, settingsLink]
const INSTALLED = [
  ['Akismet Anti-spam: Spam Protection', false, ['Activate', 'Delete'], 'Used by millions, Akismet is quite possibly the best way in the world to protect your blog from spam.', '5.7.2', 'Automattic'],
  ['Contact Form 7', true, ['Settings', 'Deactivate'], 'Just another contact form plugin. Simple but flexible.', '6.2.3', 'Rock Lobster Inc.'],
  ['Elementor', true, ['Settings', 'Deactivate'], 'The Elementor Website Builder has it all: drag and drop page builder, pixel perfect design, mobile responsive editing, and more.', '4.3.5', 'Elementor'],
];
const instaladosMain = `
  <div class="tabs"><span class="tab">Screen Options ▾</span><span class="tab">Help ▾</span></div>
  <div class="head"><h1>Plugins</h1><span class="btn2" data-z="i-add">Add Plugin</span></div>
  <div class="row1">
    <ul class="views" data-z="i-views"><li class="cur">All <span class="n">(3)</span></li><li class="pipe">|</li><li>Active <span class="n">(2)</span></li><li class="pipe">|</li><li>Inactive <span class="n">(1)</span></li><li class="pipe">|</li><li>Auto-updates Disabled <span class="n">(3)</span></li></ul>
    <span class="field" data-z="i-search">Search installed plugins…</span>
  </div>
  <div class="nav"><div class="grp" data-z="i-bulk"><span class="sel">Bulk actions ▾</span><span class="bx">Apply</span></div><div class="cnt">3 items</div></div>
  <table class="lt">
    <thead><tr><th class="cb"><span class="chk"></span></th><th class="pn">Plugin</th><th>Description</th><th class="au">Automatic Updates</th></tr></thead>
    <tbody>${INSTALLED.map(([name, active, actions, desc, version, author], k) => `
      <tr class="${active ? 'active' : 'inactive'}"${k === 0 ? ' data-z="i-inactive"' : k === 1 ? ' data-z="i-active"' : ''}>
        <td class="cb"><span class="chk"></span></td>
        <td class="pn"><strong>${name}</strong><div class="acts"${k === 0 ? ' data-z="i-activate"' : k === 1 ? ' data-z="i-deactivate"' : ''}>${actions.map(a => `<a class="${a === 'Delete' ? 'del' : ''}">${a}</a>`).join(' | ')}</div></td>
        <td><p>${desc}</p><p class="meta"${k === 1 ? ' data-z="i-meta"' : ''}>Version ${version} | By <a>${author}</a> | <a>View details</a></p></td>
        <td class="au"><a${k === 1 ? ' data-z="i-auto"' : ''}>Enable auto-updates</a></td>
      </tr>`).join('')}
    </tbody>
  </table>`;
const LIST_CSS = `
.head{display:flex;align-items:center;gap:10px;margin:6px 0 12px}
.head h1{margin:0}
.row1{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.views{list-style:none;display:flex;gap:5px;font-size:13px}
.views li{color:#3858e9}
.views li.cur{color:#1e1e1e;font-weight:600}
.views li.pipe{color:#a7aaad}
.views .n{color:#646970;font-weight:400}
.field{display:inline-flex;align-items:center;width:210px;height:30px;padding:0 8px;border:1px solid #8c8f94;border-radius:3px;background:#fff;color:#8c8f94}
.nav{display:flex;align-items:center;gap:14px;margin-bottom:8px}
.grp{display:flex;gap:6px}
.sel{display:inline-flex;align-items:center;height:30px;padding:0 24px 0 8px;border:1px solid #8c8f94;border-radius:3px;background:#fff}
.bx{display:inline-flex;align-items:center;height:30px;padding:0 10px;border:1px solid #3858e9;border-radius:3px;color:#3858e9;background:#f6f7f7}
.cnt{margin-left:auto;color:#646970}
.lt{width:100%;border-collapse:collapse;background:#fff;border:1px solid #c3c4c7}
.lt th{text-align:left;font-weight:400;padding:8px 10px;border-bottom:1px solid #c3c4c7}
.lt td{padding:10px;vertical-align:top;color:#50575e;border-bottom:1px solid #f0f0f1}
.lt .cb{width:34px}
.lt .pn{width:26%}
.lt .au{width:16%}
.chk{display:inline-block;width:16px;height:16px;border:1px solid #8c8f94;border-radius:3px;background:#fff}
tr.active td{background:#f0f6fc}
tr.active td.cb{box-shadow:inset 4px 0 #3858e9}
.lt strong{color:#1e1e1e;font-size:14px}
.acts{margin-top:6px;font-size:13px;color:#a7aaad}
.acts a{text-decoration:none}
.acts a.del{color:#b32d2e}
.lt p{margin-bottom:6px;line-height:1.5}
.meta{font-size:12.5px}
.meta a{text-decoration:none}
.au a{text-decoration:none}
`;

/* ------------------------------------------------- semáforo (standalone) */

const semaforo = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Cómo elegir un plugin</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%}
body{overflow:hidden;background:oklch(0.9524 0.0013 286.37);color:oklch(0.2103 0.0059 285.89);display:flex;align-items:center;justify-content:center;padding:6px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased}
:root{--acc:oklch(0.7819 0.1585 72.33);--fg:oklch(0.2103 0.0059 285.89);--muted:oklch(0.5517 0.0138 285.94);--line:oklch(90% 0.004 286.32);--mono:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;--code:'SFMono-Regular',ui-monospace,Menlo,Consolas,monospace;--ok:oklch(0.68 0.16 150);--warn:oklch(0.78 0.16 75);--bad:oklch(0.62 0.21 27)}
.card{width:100%;max-width:600px;background:#fff;border:1px solid var(--line);border-radius:16px;box-shadow:0 2px 4px 0 rgba(0,0,0,.04),0 1px 2px 0 rgba(0,0,0,.06),0 0 1px 0 rgba(0,0,0,.06);padding:16px;display:flex;flex-direction:column;gap:14px;opacity:0;transform:translateY(6px);animation:in .45s cubic-bezier(.22,1,.36,1) .05s forwards}
@keyframes in{to{opacity:1;transform:none}}
.ctl{display:flex;gap:5px;align-items:center}
.chip{font-family:var(--mono);font-size:12.5px;font-weight:500;line-height:1;padding:7px 12px;border-radius:999px;border:1px solid var(--line);background:#fff;color:var(--fg);cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.chip i{width:8px;height:8px;border-radius:50%}
.chip.on{background:var(--fg);border-color:var(--fg);color:#fff}
.ctl .ex{margin-left:auto;font-family:var(--mono);font-size:10px;color:var(--muted)}
.pc{border:1px solid #dcdcde;font-family:-apple-system,system-ui,'Segoe UI',Roboto,sans-serif}
.pt{display:grid;grid-template-columns:72px 1fr;gap:12px;padding:14px}
.ic{width:72px;height:72px;border-radius:4px;background:linear-gradient(135deg,#8ec5fc,#e0c3fc);display:flex;align-items:center;justify-content:center;color:#fff;font-size:30px;font-weight:700}
.pt h3{font-size:15px;color:#3858e9;font-weight:600}
.pt p{font-size:12.5px;color:#3c434a;margin-top:4px}
.pt .by{color:#646970}
.rows{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #dcdcde;background:#f6f7f7}
.m{display:flex;align-items:center;gap:8px;padding:10px 14px;font-size:12.5px;color:#3c434a;border-top:1px solid #ececec}
.m:nth-child(-n+2){border-top:0}
.m i{flex:none;width:10px;height:10px;border-radius:50%;transition:background .3s}
.m .v{transition:opacity .2s}
.st{color:#dba617;letter-spacing:-1px}
.st .e{color:#dcdcde}
.verdict{display:flex;align-items:center;gap:10px;font-size:13px}
.verdict b{font-family:var(--mono);font-size:10px;font-weight:600;padding:3px 9px;border-radius:999px;color:#fff;transition:background .3s}
.swap .v{opacity:0}
</style></head>
<body>
<div class="card" id="card">
  <div class="ctl"><button class="chip" data-v="ok"><i style="background:var(--ok)"></i>bien</button><button class="chip" data-v="warn"><i style="background:var(--warn)"></i>cuidado</button><button class="chip" data-v="bad"><i style="background:var(--bad)"></i>evitar</button><span class="ex">plugin de ejemplo</span></div>
  <div class="pc">
    <div class="pt"><div class="ic">S</div><div><h3>Super Slider</h3><p>Crea sliders de imágenes para tu web.</p><p class="by"><em>By</em> Ejemplo Studio</p></div></div>
    <div class="rows">
      <div class="m"><i data-k="rating"></i><span class="v" id="rating"></span></div>
      <div class="m"><i data-k="updated"></i><span class="v" id="updated"></span></div>
      <div class="m"><i data-k="installs"></i><span class="v" id="installs"></span></div>
      <div class="m"><i data-k="compat"></i><span class="v" id="compat"></span></div>
    </div>
  </div>
  <div class="verdict"><b id="vb"></b><span class="v" id="vt"></span></div>
</div>
<script>
const COL={ok:'var(--ok)',warn:'var(--warn)',bad:'var(--bad)'};
const st=n=>'<span class="st">'+'★'.repeat(n)+'<span class="e">'+'★'.repeat(5-n)+'</span></span>';
const DATA={
  ok:{rating:st(5)+' (2,350)',updated:'Last Updated: 1 week ago',installs:'1+ Million Active Installations',compat:'Compatible with your version of WordPress',v:'Buena opción',t:'Mantenido, muy usado y bien valorado.'},
  warn:{rating:st(3)+' (24)',updated:'Last Updated: 8 months ago',installs:'2,000+ Active Installations',compat:'Untested with your version of WordPress',v:'Revisa antes',t:'Lee las reseñas y el foro de soporte.'},
  bad:{rating:st(1)+' (6)',updated:'Last Updated: 3 years ago',installs:'Fewer than 10 Active Installations',compat:'Untested with your version of WordPress',v:'Mejor no',t:'Abandonado: busca una alternativa.'}
};
const chips=[...document.querySelectorAll('.chip')], card=document.getElementById('card');
function pick(c){
  chips.forEach(x=>x.classList.toggle('on',x===c));
  const v=c.dataset.v,d=DATA[v];
  card.classList.add('swap');
  setTimeout(()=>{
    ['rating','updated','installs','compat'].forEach(k=>{document.getElementById(k).innerHTML=d[k];document.querySelector('[data-k='+k+']').style.background=COL[v];});
    const vb=document.getElementById('vb');vb.textContent=d.v;vb.style.background=COL[v];
    document.getElementById('vt').textContent=d.t;
    card.classList.remove('swap');
  },180);
}
let timer=null;
chips.forEach(c=>c.addEventListener('click',()=>{clearInterval(timer);pick(c);}));
pick(chips[0]);
timer=setInterval(()=>{const i=chips.findIndex(c=>c.classList.contains('on'));pick(chips[(i+1)%chips.length]);},3200);
</script>
</body></html>
`;

/* ---------------------------------------------------------------- write */

const DEMOS = {
  directorio: {
    title: 'Add Plugins', mock: adminScreen({ current: 'Plugins', currentSub: 1, main: directorioMain(false) }), css: DIR_CSS,
    zones: [
      ['d-tabs', 'Featured · Popular · Recommended · Favorites', 'Explorar', 'Destacados, más populares, recomendados y favoritos.'],
      ['d-search', 'Search Plugins', 'Buscar', 'Por palabra clave, autor o etiqueta.'],
      ['d-upload', 'Upload Plugin', 'Subir plugin', 'Instala un plugin desde un archivo .zip.'],
      ['d-untested-card', 'Classic Editor', 'Un plugin del directorio', 'Gratis y revisado por WordPress.org.'],
      ['d-untested', 'Untested', 'Sin probar', 'No se ha probado con tu versión de WordPress: mira con calma.'],
    ],
    view: [160, 32, 940, 608], size: { w: 1100, h: 640 },
  },
  ficha: {
    title: 'Ficha de un plugin', mock: adminScreen({ current: 'Plugins', currentSub: 1, main: directorioMain(true) }), css: DIR_CSS,
    zones: [
      ['f-card', 'Contact Form 7', 'La ficha', 'Todo lo que necesitamos para decidir está aquí.'],
      ['f-name', 'Contact Form 7', 'Nombre', 'Y su icono, para reconocerlo.'],
      ['f-desc', 'Description', 'Descripción', 'Qué hace, en una frase.'],
      ['f-author', 'By Rock Lobster Inc.', 'Autor', 'Quién lo desarrolla y lo mantiene.'],
      ['f-rating', '★★★★ (2,184)', 'Valoración', 'La nota y cuántas personas la han puntuado.'],
      ['f-installs', '10+ Million', 'Instalaciones activas', 'Cuántas webs lo usan ahora mismo.'],
      ['f-updated', 'Last Updated', 'Última actualización', 'Si se actualiza a menudo, está mantenido.'],
      ['f-compat', 'Compatible', 'Compatibilidad', 'Probado con tu versión de WordPress.'],
      ['f-more', 'More Details', 'Más detalles', 'Ficha completa: reseñas, cambios, requisitos…'],
      ['f-install', 'Install Now', 'Instalar', 'Lo descarga; después hay que activarlo.'],
    ],
    view: [160, 32, 940, 608], size: { w: 1100, h: 640 },
  },
  instalados: {
    title: 'Plugins', mock: adminScreen({ current: 'Plugins', currentSub: 0, main: instaladosMain }), css: LIST_CSS,
    zones: [
      ['i-add', 'Add Plugin', 'Añadir plugin', 'Abre el directorio de plugins.'],
      ['i-views', 'All · Active · Inactive', 'Filtros', 'Cuántos hay de cada tipo.'],
      ['i-active', 'Contact Form 7', 'Plugin activo', 'Fondo azul: está funcionando en la web.'],
      ['i-deactivate', 'Settings | Deactivate', 'Acciones', 'Sus ajustes y el botón para desactivarlo.'],
      ['i-meta', 'Version · By · View details', 'Datos', 'Su versión, su autor y su ficha.'],
      ['i-auto', 'Enable auto-updates', 'Actualizaciones automáticas', 'Que se actualice solo cuando haya versión nueva.'],
      ['i-inactive', 'Akismet Anti-spam', 'Plugin inactivo', 'Instalado, pero sin hacer nada.'],
      ['i-activate', 'Activate | Delete', 'Activar o borrar', 'Solo se pueden borrar los inactivos.'],
      ['i-bulk', 'Bulk actions', 'Acciones en lote', 'Activar, desactivar, actualizar o borrar varios a la vez.'],
    ],
    view: [160, 32, 940, 420], size: { w: 1100, h: 640 },
  },
};

for (const [name, demo] of Object.entries(DEMOS)) {
  fs.mkdirSync(path.join(OUT, name), { recursive: true });
  fs.writeFileSync(path.join(OUT, name, 'index.html'), buildDemo(demo));
}
fs.mkdirSync(path.join(OUT, 'semaforo'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'semaforo', 'index.html'), semaforo);
console.log([...Object.keys(DEMOS), 'semaforo'].join(' '));

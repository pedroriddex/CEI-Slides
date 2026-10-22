// Generates the WordPress admin ("El panel") demos: node scripts/generate-panel-demos.mjs public/media/wordpress/panel
// A faithful HTML recreation of a clean WordPress 7.1 dashboard (English UI). See scripts/lib/wp-admin-demo.mjs.
import fs from 'node:fs'; import path from 'node:path';
import { MENU, slugOf, adminScreen, buildDemo } from './lib/wp-admin-demo.mjs';
const OUT = process.argv[2];

const DASHBOARD = `
    <div class="tabs"><span class="tab" data-z="d-screen">Screen Options ▾</span><span class="tab" data-z="d-help">Help ▾</span></div>
    <h1>Dashboard</h1>
    <div class="welcome" data-z="d-welcome">
      <div class="wh"><span class="x">✕ Dismiss</span><h2>Welcome to WordPress!</h2><a>Learn more about the 7.1.3 version.</a></div>
      <div class="wc">
        <div><span class="ic dashicons dashicons-edit"></span><h3>Author rich content with blocks and patterns</h3><p>Block patterns are pre-configured block layouts.</p><a>Add a new page</a></div>
        <div><span class="ic dashicons dashicons-layout"></span><h3>Customize your entire site with block themes</h3><p>Design everything on your site — from the header down to the footer.</p><a>Open site editor</a></div>
        <div><span class="ic dashicons dashicons-admin-appearance"></span><h3>Switch up your site’s look &amp; feel with Styles</h3><p>Tweak your site, or give it a whole new look!</p><a>Edit styles</a></div>
      </div>
    </div>
    <div class="cols">
      <div class="col">
        <div class="box" data-z="d-health"><h4>Site Health Status</h4><div class="bd"><span class="ring"></span><span class="muted">No information yet…</span></div></div>
        <div class="box" data-z="d-glance"><h4>At a Glance</h4><div class="bd glance"><span><span class="dashicons dashicons-admin-post"></span>1 Published post</span><span><span class="dashicons dashicons-admin-page"></span>1 Published page</span><span><span class="dashicons dashicons-admin-comments"></span>1 Comment</span><p class="muted">WordPress 7.1.3 running Twenty Twenty-Five theme.</p></div></div>
        <div class="box" data-z="d-activity"><h4>Activity</h4><div class="bd"><p class="muted">Recently Published</p><p><span class="muted">Today, 6:55 am</span> <a>Hello world!</a></p><p class="muted">Recent Comments</p><p>From A WordPress Commenter on <a>Hello world!</a></p></div></div>
      </div>
      <div class="col">
        <div class="box" data-z="d-draft"><h4>Quick Draft</h4><div class="bd"><label>Title</label><span class="input"></span><label>Content</label><span class="input ta">What’s on your mind?</span><span class="btn">Save Draft</span></div></div>
        <div class="box" data-z="d-news"><h4>WordPress Events and News</h4><div class="bd"><p class="muted">Attend an upcoming event near you.</p><p><a>WordCamp</a> · <a>Meetup</a></p><p><a>WordPress News</a></p></div></div>
      </div>
    </div>`;

const CSS = `
.welcome{border-radius:8px;overflow:hidden;background:#fff;border:1px solid #c3c4c7}
.wh{position:relative;background:#1e1e1e;color:#fff;padding:22px 26px}
.wh h2{font-size:30px;font-weight:600;letter-spacing:-.01em;margin-bottom:8px}
.wh a{color:#fff;font-size:14px}
.wh .x{position:absolute;right:16px;top:14px;font-size:12px;color:#fff}
.wc{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;padding:18px 26px}
.wc>div{display:grid;grid-template-columns:34px 1fr;column-gap:12px}
.wc .ic{grid-row:span 3;width:34px;height:34px;border-radius:2px;background:#1e1e1e;color:#fff;font-size:18px;display:flex;align-items:center;justify-content:center}
.wc h3{font-size:14px;font-weight:500;margin-bottom:4px}
.wc p{font-size:12px;color:#50575e;margin-bottom:4px}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}
.col{display:flex;flex-direction:column;gap:14px}
.box{background:#fff;border:1px solid #c3c4c7;border-radius:8px;overflow:hidden}
.box h4{font-size:14px;font-weight:600;padding:9px 12px;border-bottom:1px solid #f0f0f1}
.bd{padding:10px 12px;display:flex;flex-direction:column;gap:5px}
.bd .ring{width:34px;height:34px;border-radius:50%;border:4px solid #dcdcde}
.glance{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.glance>span{display:flex;align-items:center;gap:5px;color:#3858e9}
.glance .dashicons{font-size:16px;width:16px;height:16px;color:#646970}
.glance p{grid-column:span 2}
label{font-size:12px;color:#1e1e1e}
.input{display:block;height:28px;border:1px solid #8c8f94;border-radius:2px;padding:5px 8px;color:#a7aaad}
.input.ta{height:46px}
.bd .btn{margin-top:4px}
`;

const mock = adminScreen({ current: 'Dashboard', main: DASHBOARD });

const DEMOS = {
  zonas: {
    zones: [
      ['z-bar', 'Toolbar', 'Barra de herramientas', 'Atajos rápidos. Siempre visible, también en la web.'],
      ['z-menu', 'Admin menu', 'Menú lateral', 'Todas las secciones del panel.'],
      ['z-main', 'Work area', 'Área de trabajo', 'Cambia según la sección que elijamos en el menú.'],
    ],
    view: [0, 0, 1100, 640], size: { w: 1100 }, zoom: false,
  },
  barra: {
    zones: [
      ['b-logo', 'WordPress', 'Logo', 'Enlaces a la documentación y a la comunidad.'],
      ['b-site', 'Pruebas', 'Nombre del sitio', 'Visita la web tal y como la ven los demás.'],
      ['b-cmd', '⌘K', 'Paleta de comandos', 'Escribe lo que buscas y salta directamente.'],
      ['b-comments', 'Comments', 'Comentarios', 'Los comentarios pendientes de revisar.'],
      ['b-new', 'New', 'Nuevo', 'Crea una entrada, un archivo, una página o un usuario.'],
      ['b-account', 'Howdy, root', 'Hola, root', 'Tu perfil y el botón para cerrar sesión.'],
    ],
    // a narrower mock makes the toolbar readable
    view: [0, 0, 760, 330], size: { w: 760 },
  },
  menu: {
    zones: [
      ...MENU.filter(m => m !== '---').map(([, name, es, desc]) => [`m-${slugOf(name)}`, name, es, desc]),
      ['m-collapse', 'Collapse Menu', 'Contraer menú', 'Reduce el menú a solo iconos.'],
    ],
    view: [0, 0, 520, 640], size: { w: 1100 }, menuMode: true,
  },
  escritorio: {
    zones: [
      ['d-welcome', 'Welcome', 'Bienvenida', 'Accesos rápidos para empezar. Se puede cerrar.'],
      ['d-health', 'Site Health Status', 'Salud del sitio', 'Avisa si algo falla en seguridad o rendimiento.'],
      ['d-glance', 'At a Glance', 'De un vistazo', 'Cuánto contenido hay y qué versión usamos.'],
      ['d-activity', 'Activity', 'Actividad', 'Lo último publicado y los comentarios recientes.'],
      ['d-draft', 'Quick Draft', 'Borrador rápido', 'Apunta una idea como borrador en segundos.'],
      ['d-news', 'Events and News', 'Eventos y noticias', 'Eventos cercanos y novedades de WordPress.'],
      ['d-screen', 'Screen Options', 'Opciones de pantalla', 'Elige qué cajas se ven en esta pantalla.'],
      ['d-help', 'Help', 'Ayuda', 'Explica la pantalla en la que estás.'],
    ],
    view: [0, 32, 940, 712], size: { w: 940, h: 750, cls: 'no-menu' },
  },
};

for (const [name, demo] of Object.entries(DEMOS)) {
  fs.mkdirSync(path.join(OUT, name), { recursive: true });
  fs.writeFileSync(path.join(OUT, name, 'index.html'), buildDemo({ title: 'El panel de WordPress', mock, css: CSS, ...demo }));
}
console.log(Object.keys(DEMOS).join(' '));

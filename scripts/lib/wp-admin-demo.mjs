// Shared pieces for the WordPress admin demos (HTML recreations of a clean WordPress 7.1, English UI).
// Each demo highlights a set of zones on hover — and autoplays through them, zooming the "camera" in,
// when nobody touches it — with a caption: name · Spanish translation · role.

export const MENU = [
  ['dashboard', 'Dashboard', 'Escritorio', 'La pantalla de inicio del panel y las actualizaciones.', ['Home', 'Updates']],
  '---',
  ['admin-post', 'Posts', 'Entradas', 'Los artículos del blog, con sus categorías y etiquetas.', ['All Posts', 'Add Post', 'Categories', 'Tags']],
  ['admin-media', 'Media', 'Medios', 'La biblioteca de imágenes, vídeos y documentos.', ['Library', 'Add Media File']],
  ['admin-page', 'Pages', 'Páginas', 'El contenido fijo: inicio, contacto, sobre nosotros…', ['All Pages', 'Add Page']],
  ['admin-comments', 'Comments', 'Comentarios', 'Los comentarios de los visitantes, para moderarlos.', []],
  '---',
  ['admin-appearance', 'Appearance', 'Apariencia', 'El aspecto de la web: tema, editor del sitio y fuentes.', ['Themes', 'Editor', 'Fonts']],
  ['admin-plugins', 'Plugins', 'Plugins', 'Instalar, activar y desactivar plugins.', ['Installed Plugins', 'Add Plugin']],
  ['admin-users', 'Users', 'Usuarios', 'Quién puede entrar en el panel y qué puede hacer.', ['All Users', 'Add User', 'Profile']],
  ['admin-tools', 'Tools', 'Herramientas', 'Importar, exportar y revisar la salud del sitio.', ['Available Tools', 'Import', 'Export', 'Site Health', 'Export Personal Data', 'Erase Personal Data', 'Theme File Editor', 'Plugin File Editor']],
  ['admin-settings', 'Settings', 'Ajustes', 'La configuración general de la web.', ['General', 'Connectors', 'Writing', 'Reading', 'Discussion', 'Media', 'Permalinks', 'Privacy']],
];

export const slugOf = s => s.toLowerCase().replace(/[^a-z]+/g, '-');

function menuHtml(currentName, currentSub) {
  return MENU.map(m => {
    if (m === '---') return '<li class="sep"></li>';
    const [icon, name, , , sub] = m;
    const current = name === currentName;
    const subHtml = sub.length ? `<ul class="sub">${sub.map((s, i) => `<li class="${current && i === currentSub ? 'cur' : ''}">${s}${s === 'Updates' ? ' <b class="count">0</b>' : ''}</li>`).join('')}</ul>` : '';
    return `<li class="mi${current ? ' current' : ''}" data-z="m-${slugOf(name)}"><a><span class="dashicons dashicons-${icon}"></span><span class="mn">${name}</span>${name === 'Comments' ? '<b class="count">0</b>' : ''}</a>${subHtml}</li>`;
  }).join('') + '<li class="mi collapse" data-z="m-collapse"><a><span class="dashicons dashicons-admin-collapse"></span><span class="mn">Collapse Menu</span></a></li>';
}

export function adminBar({ viewLink = '' } = {}) {
  return `
  <div class="bar" data-z="z-bar">
    <div class="bl">
      <span class="bi" data-z="b-logo"><span class="dashicons dashicons-wordpress"></span></span>
      <span class="bi" data-z="b-site"><span class="dashicons dashicons-admin-home"></span>Pruebas</span>
      <span class="bi" data-z="b-cmd"><span class="kbd">⌘K</span></span>
      <span class="bi" data-z="b-comments"><span class="dashicons dashicons-admin-comments"></span>0</span>
      <span class="bi" data-z="b-new"><span class="dashicons dashicons-plus"></span>New</span>
      ${viewLink ? `<span class="bi">${viewLink}</span>` : ''}
    </div>
    <div class="br"><span class="bi" data-z="b-account">Howdy, root <span class="avatar"></span></span></div>
  </div>`;
}

/** Admin screen: toolbar + side menu + main area. */
export function adminScreen({ current = 'Dashboard', currentSub = 0, main = '' }) {
  return `
<div class="wp" id="wp">
  ${adminBar()}
  <div class="side" data-z="z-menu"><ul class="menu">${menuHtml(current, currentSub)}</ul></div>
  <div class="main" data-z="z-main">${main}</div>
</div>`;
}

export const BASE_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%}
body{overflow:hidden;background:oklch(0.9524 0.0013 286.37);color:oklch(0.2103 0.0059 285.89);display:flex;align-items:center;justify-content:center;padding:6px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased}
:root{--acc:oklch(0.7819 0.1585 72.33);--fg:oklch(0.2103 0.0059 285.89);--muted:oklch(0.5517 0.0138 285.94);--line:oklch(90% 0.004 286.32);--mono:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;--code:'SFMono-Regular',ui-monospace,Menlo,Consolas,monospace}
.card{width:100%;height:100%;background:#fff;border:1px solid var(--line);border-radius:16px;box-shadow:0 2px 4px 0 rgba(0,0,0,.04),0 1px 2px 0 rgba(0,0,0,.06),0 0 1px 0 rgba(0,0,0,.06);padding:16px;display:flex;flex-direction:column;gap:14px;opacity:0;transform:translateY(6px);animation:in .45s cubic-bezier(.22,1,.36,1) .05s forwards}
@keyframes in{to{opacity:1;transform:none}}
.vp{position:relative;flex:1;min-height:0;border-radius:10px;overflow:hidden;background:#f0f0f1;outline:1px solid var(--line)}
.stage{position:absolute;left:0;top:0;transform-origin:0 0;transition:transform .8s cubic-bezier(.65,0,.35,1)}
.stage.instant{transition:none}
.cap{flex:none;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;min-height:20px;padding:0 4px 2px;transition:opacity .2s}
.cap.swap{opacity:0}
.cap .n{font-size:14px;font-weight:600;letter-spacing:-.005em}
.cap .t{font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--acc)}
.cap .d{font-size:13px;font-weight:500;color:var(--muted)}
/* highlight */
.hl{position:absolute;pointer-events:none;border:3px solid var(--acc);border-radius:6px;background:color-mix(in oklab,var(--acc) 18%,transparent);box-shadow:0 0 0 9999px rgba(0,0,0,.28);transition:left .35s cubic-bezier(.22,1,.36,1),top .35s cubic-bezier(.22,1,.36,1),width .35s cubic-bezier(.22,1,.36,1),height .35s cubic-bezier(.22,1,.36,1),opacity .2s;opacity:0;z-index:20}
.hl.on{opacity:1}

/* ---- WordPress 7.1 admin chrome ---- */
.wp{position:relative;width:1100px;height:640px;background:#f0f0f1;font-family:-apple-system,system-ui,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif;font-size:13px;color:#1e1e1e;overflow:hidden}
.wp a{color:#3858e9;text-decoration:underline}
.bar{position:absolute;left:0;top:0;right:0;height:32px;background:#1e1e1e;color:#fff;display:flex;justify-content:space-between;align-items:center;z-index:3}
.bl,.br{display:flex;height:100%}
.bi{display:flex;align-items:center;gap:5px;padding:0 9px;height:100%;font-size:13px;white-space:nowrap}
.bi .dashicons{font-size:20px;width:20px;height:20px;color:#a7aaad}
.kbd{font-size:11px;padding:2px 6px;border:1px solid #50575e;border-radius:4px;color:#c3c4c7}
.avatar{width:18px;height:18px;border-radius:50%;background:#c3c4c7;display:inline-block}
.side{position:absolute;left:0;top:32px;bottom:0;width:160px;background:#1e1e1e;z-index:2}
.menu{list-style:none;padding-top:10px}
.mi{position:relative}
.mi>a{display:flex;align-items:center;gap:8px;height:34px;padding:0 10px;color:#fff;font-size:14px;text-decoration:none}
.mi>a .dashicons{font-size:20px;width:20px;height:20px;color:#a7aaad}
.mi.current>a{background:#3858e9}
.mi.current>a .dashicons{color:#fff}
.sep{height:9px}
.count{display:inline-block;margin-left:4px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#3c434a;color:#fff;font-size:9px;line-height:18px;text-align:center;font-weight:600}
.sub{list-style:none;background:#0c0c0c;padding:6px 0}
.sub li{padding:5px 12px 5px 38px;color:rgba(240,246,252,.7);font-size:13px}
.sub li.cur{color:#fff;font-weight:600}
.mi:not(.current) .sub{display:none;position:absolute;left:160px;top:0;width:180px;padding:6px 0;box-shadow:0 3px 5px rgba(0,0,0,.2)}
.mi:not(.current) .sub li{padding-left:14px}
.mi.fly .sub{display:block}
.mi.fly>a{background:#0c0c0c;color:#72aee6}
.collapse>a{color:#a7aaad;font-size:13px}
.main{position:absolute;left:160px;top:32px;right:0;bottom:0;padding:0 20px}
.wp.no-menu .side{display:none}
.wp.no-menu .main{left:0}
.tabs{display:flex;justify-content:flex-end;gap:6px}
.tab{background:#fff;border:1px solid #c3c4c7;border-top:0;border-radius:0 0 4px 4px;padding:5px 12px;color:#50575e;font-size:13px}
h1{font-size:23px;font-weight:400;margin:6px 0 14px}
.muted{color:#646970}
.btn{align-self:flex-start;background:#3858e9;color:#fff;border-radius:2px;padding:6px 12px;font-size:13px}
.btn2{display:inline-block;border:1px solid #3858e9;color:#3858e9;background:#fff;border-radius:3px;padding:4px 10px;font-size:13px}
`;

/**
 * Builds a demo page.
 * @param {object} o
 * @param {string} o.title       page title
 * @param {string} o.mock        the .wp element (must have id="wp")
 * @param {string} [o.css]       extra CSS for this mock
 * @param {Array}  o.zones       [data-z, name, translation, description][]
 * @param {Array}  o.view        [x, y, w, h] region of the mock to frame
 * @param {object} [o.size]      {w, h, cls} mock size and extra classes
 * @param {boolean} [o.zoom]     zoom the camera to each zone while autoplaying
 * @param {boolean} [o.menuMode] highlight the menu link and open its flyout
 * @param {string} [o.dashicons] href of dashicons.min.css
 */
export function buildDemo({ title, mock, css = '', zones, view, size = {}, zoom = true, menuMode = false, dashicons = '../dashicons.min.css' }) {
  const sized = mock.replace('<div class="wp" id="wp">', `<div class="wp ${size.cls || ''}" id="wp" style="width:${size.w || 1100}px;height:${size.h || 640}px">`);
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title>
<link rel="stylesheet" href="${dashicons}">
<style>${BASE_CSS}${css}</style></head>
<body>
<div class="card">
  <div class="vp" id="vp"><div class="stage" id="stage">${sized}<div class="hl" id="hl"></div></div></div>
  <div class="cap" id="cap"><span class="n" id="cn"></span><span class="t" id="ct"></span><span class="d" id="cd"></span></div>
</div>
<script>
  const ZONES = ${JSON.stringify(zones)};
  const VIEW = ${JSON.stringify(view)};
  const MENU_MODE = ${menuMode};
  const ZOOM = ${zoom};
  const vp = document.getElementById('vp'), stage = document.getElementById('stage'), wp = document.getElementById('wp');
  const hl = document.getElementById('hl'), cap = document.getElementById('cap');
  let scale = 1, current = null, zoomed = false;

  // camera: frames the whole VIEW, or zooms towards the selected zone while autoplaying
  function frame(box, instant) {
    const W = vp.clientWidth, H = vp.clientHeight;
    let [x, y, w, h] = box;
    const ar = W / H;
    if (w / h < ar) { const nw = h * ar; x -= (nw - w) / 2; w = nw; } else { const nh = w / ar; y -= (nh - h) / 2; h = nh; }
    const [vx, vy, vw, vh] = VIEW;
    const s = Math.min(W / w, H / h);
    if (w <= vw) x = Math.max(vx, Math.min(x, vx + vw - w)); else x = vx - (w - vw) / 2;
    if (h <= vh) y = Math.max(vy, Math.min(y, vy + vh - h)); else y = vy - (h - vh) / 2;
    // never frame empty space outside the mock when it can be avoided
    const mw = wp.offsetWidth, mh = wp.offsetHeight;
    if (w <= mw) x = Math.max(0, Math.min(x, mw - w)); else x = (mw - w) / 2;
    if (h <= mh) y = Math.max(0, Math.min(y, mh - h)); else y = 0;
    scale = s;
    stage.classList.toggle('instant', !!instant);
    stage.style.transform = 'translate(' + (-x * s) + 'px,' + (-y * s) + 'px) scale(' + s + ')';
    hl.style.borderWidth = (3 / s) + 'px'; hl.style.borderRadius = (6 / s) + 'px';
  }
  function target(z) {
    const el = wp.querySelector('[data-z="' + z[0] + '"]');
    return MENU_MODE ? el.querySelector('a') : el;
  }
  function unscaledRect(el) {
    // offset of el inside the mock, independent of the current transform
    let x = 0, y = 0, n = el;
    while (n && n !== wp) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  }
  function zoomBox(z) {
    const r = unscaledRect(target(z));
    const [, , vw, vh] = VIEW;
    // zoom in, but never further out than the whole view
    const w = Math.min(Math.max(r.w * 1.6, vw * 0.55), vw), h = Math.min(Math.max(r.h * 1.6, vh * 0.55), vh);
    return [r.x + r.w / 2 - w / 2, r.y + r.h / 2 - h / 2, w, h];
  }
  function fit(instant) { frame(zoomed && current ? zoomBox(current) : VIEW, instant); }
  function place(z) {
    const r = unscaledRect(target(z)), pad = 3;
    Object.assign(hl.style, { left: r.x - pad + 'px', top: r.y - pad + 'px', width: r.w + pad * 2 + 'px', height: r.h + pad * 2 + 'px' });
  }
  function select(z) {
    if (current === z) return;
    current = z;
    if (MENU_MODE) wp.querySelectorAll('.mi').forEach(li => li.classList.toggle('fly', li.dataset.z === z[0]));
    place(z); hl.classList.add('on');
    if (zoomed) frame(zoomBox(z));
    cap.classList.add('swap');
    setTimeout(() => {
      document.getElementById('cn').textContent = z[1];
      document.getElementById('ct').textContent = z[2];
      document.getElementById('cd').textContent = z[3];
      cap.classList.remove('swap');
    }, 150);
  }

  // hover picks the zone under the pointer; autoplay (with zoom) when idle
  const byId = Object.fromEntries(ZONES.map(z => [z[0], z]));
  let i = 0, timer = null;
  const tick = () => { select(ZONES[i]); i = (i + 1) % ZONES.length; };
  const play = () => { if (!timer) { zoomed = ZOOM; if (current) frame(zoomed ? zoomBox(current) : VIEW); timer = setInterval(tick, 3200); } };
  const pause = () => { clearInterval(timer); timer = null; if (zoomed) { zoomed = false; frame(VIEW); } };
  vp.addEventListener('mousemove', e => {
    let el = document.elementFromPoint(e.clientX, e.clientY);
    while (el && el !== wp) { if (el.dataset && byId[el.dataset.z]) break; el = el.parentElement; }
    if (el && el !== wp) { pause(); i = (ZONES.indexOf(byId[el.dataset.z]) + 1) % ZONES.length; select(byId[el.dataset.z]); }
  });
  vp.addEventListener('mouseenter', pause);
  vp.addEventListener('mouseleave', play);
  window.addEventListener('resize', () => fit(true));
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { frame(VIEW, true); tick(); play(); });
</script>
</body></html>
`;
}

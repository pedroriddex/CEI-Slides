// Generates the "El editor de Elementor" demos: node scripts/generate-elementor-editor-demos.mjs public/media/elementor/editor
// Real screenshots of the Elementor 4.3.5 editor (taken in the "Pruebas" Local WP site, 1389×935 viewport,
// captured as 2× tiles and stitched) with hover zones on top, using the same engine as the WordPress admin demos.
// Zone rects are in editor CSS pixels; K converts them to screenshot pixels.
import fs from 'node:fs'; import path from 'node:path';
import { buildDemo } from './lib/wp-admin-demo.mjs';
const OUT = process.argv[2];
const K = 800 / 694.5; // screenshot px per editor css px (2× zoom tiles of 800px)

// shot: [file, width, height, cssOffsetX, cssOffsetY]
const SHOTS = {
  inicio: ['inicio.jpg', 1600, 1076, 0, 0],
  widget: ['widget.jpg', 1600, 1076, 0, 0],
  estilo: ['estilo.jpg', 800, 1076, 0, 0],
  avanzado: ['avanzado.jpg', 800, 1076, 0, 0],
  movil: ['movil.jpg', 1600, 1076, 0, 0],
  estructura: ['estructura.jpg', 800, 1076, 694.5, 0],
  historial: ['historial.jpg', 800, 1076, 0, 0],
  pagina: ['pagina.jpg', 800, 1076, 0, 0],
  'menu-logo': ['menu-logo.jpg', 800, 538, 0, 0],
  publicar: ['publicar.jpg', 800, 538, 694.5, 0],
};

// [id, [x, y, w, h] in editor css px, name, translation, description]
const DEMOS = {
  zonas: { shot: 'inicio', zoom: false, zones: [
    ['z-top', [0, 0, 1389, 48], 'Top bar', 'Barra superior', 'Herramientas generales: añadir, historial, vista móvil, publicar…'],
    ['z-panel', [0, 48, 280, 887], 'Panel', 'Panel lateral', 'Los widgets y los ajustes de lo que seleccionemos.'],
    ['z-canvas', [295, 48, 1094, 887], 'Canvas', 'Lienzo', 'La página, tal y como se verá publicada.'],
    ['z-nav', [1119, 100, 240, 468], 'Structure', 'Estructura', 'El esquema de todos los elementos de la página.'],
  ] },
  barra: { shot: 'inicio', view: [0, 0, 1389, 330], zones: [
    ['b-logo', [24, 7, 35, 35], 'Elementor', 'Menú principal', 'Ajustes del sitio, preferencias y salir a WordPress.'],
    ['b-add', [71, 7, 34, 34], 'Add Element', 'Añadir elemento', 'Abre el panel de widgets.'],
    ['b-ai', [117, 7, 34, 34], 'Angie', 'Asistente de IA', 'El asistente con inteligencia artificial de Elementor.'],
    ['b-history', [163, 7, 34, 34], 'History', 'Historial', 'Deshacer cambios y recuperar versiones.'],
    ['b-page', [209, 7, 34, 34], 'Page Settings', 'Ajustes de página', 'Título, estado, imagen destacada…'],
    ['b-doc', [498, 10, 199, 28], 'Página con Elementor (Draft)', 'Documento', 'Qué estamos editando y su estado.'],
    ['b-devices', [723, 0, 168, 48], 'Desktop · Tablet · Mobile', 'Dispositivos', 'Ver y ajustar la página en cada pantalla.'],
    ['b-news', [1049, 6, 36, 36], "What's New", 'Novedades', 'Las novedades de Elementor.'],
    ['b-finder', [1097, 6, 36, 36], 'Finder', 'Buscador', 'Salta a cualquier página o ajuste escribiendo.'],
    ['b-structure', [1145, 7, 34, 34], 'Structure', 'Estructura', 'Muestra u oculta el esquema de la página.'],
    ['b-preview', [1191, 6, 36, 36], 'Preview Changes', 'Vista previa', 'Ver la página sin el editor.'],
    ['b-publish', [1239, 0, 110, 48], 'Publish', 'Publicar', 'Publica la página o guarda los cambios.'],
    ['b-options', [1349, 0, 40, 48], 'Save Options', 'Más opciones', 'Guardar borrador, como plantilla o ver la página.'],
  ] },
  panel: { shot: 'inicio', view: [0, 0, 560, 935], zones: [
    ['p-panel', [0, 48, 280, 887], 'Elements', 'Panel de elementos', 'Todo lo que podemos añadir a la página.'],
    ['p-header', [0, 48, 280, 48], 'Elements', 'Cabecera', 'Indica qué muestra el panel en cada momento.'],
    ['p-tabs', [0, 96, 280, 36], 'Widgets · Globals', 'Pestañas', 'Los widgets y los elementos globales.'],
    ['p-search', [0, 132, 280, 65], 'Search Widget…', 'Buscar', 'Encuentra un widget por su nombre.'],
    ['p-promo', [0, 197, 280, 347], 'Atomic Elements', 'Aviso', 'Una novedad de Elementor. Se puede cerrar.'],
    ['p-layout', [0, 544, 280, 155], 'Layout', 'Estructura', 'Container y Grid: las cajas que organizan la página.'],
    ['p-basic', [0, 699, 280, 196], 'Basic', 'Básicos', 'Heading, Image, Text Editor, Button…'],
    ['p-pro', [0, 895, 280, 40], 'Access all Pro widgets', 'Versión Pro', 'Más widgets, de pago.'],
    ['p-collapse', [280, 467, 15, 50], '‹', 'Ocultar panel', 'Esconde el panel para ver la página a lo ancho.'],
  ] },
  lienzo: { shot: 'inicio', view: [280, 48, 1109, 887], zones: [
    ['c-header', [330, 64, 1040, 44], 'Pruebas · Sample Page', 'Cabecera del tema', 'La pone el tema activo, no Elementor.'],
    ['c-title', [500, 255, 455, 60], 'Página con Elementor', 'Título de la página', 'También lo pone el tema.'],
    ['c-drop', [525, 432, 604, 152], 'Drag widget here', 'Zona para soltar', 'Arrastra aquí un widget para empezar.'],
    ['c-add', [762, 474, 40, 40], '+', 'Añadir contenedor', 'Crea una caja nueva para la página.'],
    ['c-templates', [807, 474, 40, 40], 'Templates', 'Plantillas', 'Inserta diseños prediseñados.'],
    ['c-ai', [852, 474, 40, 40], 'AI', 'Crear con IA', 'Genera una sección describiéndola.'],
    ['c-footer', [330, 820, 1040, 115], 'Footer', 'Pie del tema', 'También lo pone el tema.'],
  ] },
  widget: { shot: 'widget', zones: [
    ['w-heading', [515, 337, 625, 31], 'Heading', 'Widget seleccionado', 'Al hacer clic en un widget, el panel muestra sus ajustes.'],
    ['w-header', [0, 48, 280, 48], 'Edit Heading', 'Editando', 'El widget cuyos ajustes estamos viendo.'],
    ['w-tabs', [0, 96, 280, 58], 'Content · Style · Advanced', 'Pestañas', 'Contenido, estilo y opciones avanzadas.'],
    ['w-section', [0, 169, 280, 58], 'Heading', 'Sección', 'Los ajustes se agrupan en secciones plegables.'],
    ['w-title', [0, 227, 280, 121], 'Title', 'Texto', 'Lo que dice el título.'],
    ['w-link', [0, 348, 280, 64], 'Link', 'Enlace', 'Convierte el título en un enlace.'],
    ['w-tag', [0, 412, 280, 42], 'HTML Tag', 'Nivel del título', 'H1, H2, H3… la importancia del título.'],
    ['w-container', [505, 327, 645, 205], 'Container', 'Contenedor', 'La caja que agrupa título, texto y botón.'],
    ['w-text', [515, 388, 625, 72], 'Text Editor', 'Widget de texto', 'Un párrafo de texto.'],
    ['w-button', [515, 480, 625, 42], 'Button', 'Widget de botón', 'Un botón con su texto y su enlace.'],
    ['w-help', [0, 718, 280, 28], 'Need Help', 'Ayuda', 'Abre la documentación de este widget.'],
  ] },
  estilo: { shot: 'estilo', zones: [
    ['s-tab', [95, 96, 81, 57], 'Style', 'Estilo', 'Cómo se ve el widget.'],
    ['s-align', [0, 227, 280, 42], 'Alignment', 'Alineación', 'Izquierda, centro, derecha o justificado.'],
    ['s-typo', [0, 269, 280, 57], 'Typography', 'Tipografía', 'Fuente, tamaño, grosor…'],
    ['s-stroke', [0, 326, 280, 42], 'Text Stroke', 'Contorno', 'Un borde alrededor de las letras.'],
    ['s-shadow', [0, 368, 280, 42], 'Text Shadow', 'Sombra', 'Una sombra para el texto.'],
    ['s-blend', [0, 410, 280, 42], 'Blend Mode', 'Fusión', 'Cómo se mezcla con lo que tiene detrás.'],
    ['s-states', [0, 467, 280, 42], 'Normal · Hover', 'Estados', 'Cómo se ve normal y al pasar el ratón.'],
    ['s-color', [0, 509, 280, 42], 'Text Color', 'Color del texto', 'El color de las letras.'],
  ] },
  avanzado: { shot: 'avanzado', zones: [
    ['a-tab', [176, 96, 104, 57], 'Advanced', 'Avanzado', 'Opciones extra, comunes a todos los widgets.'],
    ['a-layout', [0, 169, 280, 48], 'Layout', 'Espaciado', 'Margin y padding: el espacio fuera y dentro.'],
    ['a-motion', [0, 217, 280, 48], 'Motion Effects', 'Animaciones', 'Animaciones al aparecer en pantalla.'],
    ['a-transform', [0, 265, 280, 48], 'Transform', 'Transformar', 'Girar, escalar o mover el widget.'],
    ['a-background', [0, 313, 280, 48], 'Background', 'Fondo', 'Color o imagen de fondo.'],
    ['a-border', [0, 361, 280, 48], 'Border', 'Borde', 'Bordes, esquinas redondeadas y sombra.'],
    ['a-mask', [0, 409, 280, 48], 'Mask', 'Máscara', 'Recorta el widget con una forma.'],
    ['a-responsive', [0, 457, 280, 48], 'Responsive', 'Visibilidad', 'Ocultarlo en ordenador, tableta o móvil.'],
    ['a-attributes', [0, 505, 280, 48], 'Attributes', 'Atributos', 'Opción de la versión Pro.'],
    ['a-css', [0, 553, 280, 48], 'Custom CSS', 'CSS propio', 'Opción de la versión Pro.'],
  ] },
  movil: { shot: 'movil', zones: [
    ['m-devices', [723, 0, 168, 48], 'Desktop · Tablet · Mobile', 'Dispositivos', 'Cambia la vista del lienzo.'],
    ['m-mobile', [835, 0, 56, 48], 'Mobile', 'Móvil', 'La vista activa: hasta 767 px de ancho.'],
    ['m-frame', [655, 68, 360, 736], 'Mobile Portrait', 'Página en móvil', 'Los mismos elementos, colocados para una pantalla estrecha.'],
    ['m-panel', [0, 48, 280, 887], 'Panel', 'Ajustes por dispositivo', 'Los ajustes con el icono de pantalla pueden ser distintos en cada vista.'],
  ] },
  estructura: { shot: 'estructura', zones: [
    ['n-panel', [1119, 100, 240, 468], 'Structure', 'Estructura', 'El esquema de todos los elementos, como un índice.'],
    ['n-container', [1120, 137, 238, 30], 'Container', 'Contenedor', 'La caja principal. Se puede plegar.'],
    ['n-heading', [1120, 167, 238, 30], 'Heading', 'Título', 'El elemento seleccionado aparece marcado.'],
    ['n-text', [1120, 197, 238, 30], 'Text Editor', 'Texto', 'Arrastrando las filas cambiamos el orden.'],
    ['n-button', [1120, 227, 238, 30], 'Button', 'Botón', 'Haz clic en uno para seleccionarlo.'],
  ] },
  historial: { shot: 'historial', zones: [
    ['h-actions', [0, 96, 135, 35], 'Actions', 'Acciones', 'Todo lo que hemos hecho en esta sesión.'],
    ['h-revisions', [135, 96, 145, 35], 'Revisions', 'Revisiones', 'Versiones guardadas anteriormente.'],
    ['h-current', [20, 162, 240, 37], 'Button Added', 'Estado actual', 'Haz clic en una acción anterior para volver a ella.'],
    ['h-list', [20, 209, 240, 133], 'Added', 'Acciones anteriores', 'De la más reciente a la más antigua.'],
    ['h-start', [20, 352, 240, 37], 'Editing Started', 'Inicio', 'Cómo estaba la página al abrir el editor.'],
  ] },
  pagina: { shot: 'pagina', zones: [
    ['g-tabs', [0, 96, 280, 57], 'Settings · Style · Advanced', 'Pestañas', 'Ajustes de toda la página, no de un widget.'],
    ['g-title', [0, 221, 280, 60], 'Title', 'Título', 'El título de la página.'],
    ['g-status', [0, 286, 280, 40], 'Status', 'Estado', 'Borrador, pendiente, privada o publicada.'],
    ['g-featured', [0, 345, 280, 135], 'Featured Image', 'Imagen destacada', 'La imagen que representa a la página.'],
    ['g-comments', [0, 553, 280, 36], 'Allow Comments', 'Comentarios', 'Permitir o no comentarios.'],
    ['g-hide', [0, 600, 280, 72], 'Hide Title', 'Ocultar título', 'Esconde el título que pone el tema.'],
    ['g-layout', [0, 680, 280, 92], 'Page Layout', 'Diseño de página', 'Con o sin cabecera y pie del tema, o a pantalla completa.'],
  ] },
  'menu-logo': { shot: 'menu-logo', zones: [
    ['l-logo', [24, 7, 35, 35], 'Elementor', 'Menú', 'Al hacer clic en el logo se abre este menú.'],
    ['l-site', [24, 62, 191, 32], 'Site Settings', 'Ajustes del sitio', 'Colores, tipografías y logo globales de toda la web.'],
    ['l-theme', [24, 94, 191, 32], 'Theme Builder', 'Constructor de temas', 'Diseñar cabecera, pie y plantillas (versión Pro).'],
    ['l-prefs', [24, 126, 191, 32], 'User Preferences', 'Preferencias', 'Cómo se comporta el editor para ti.'],
    ['l-keys', [24, 158, 191, 32], 'Keyboard Shortcuts', 'Atajos de teclado', 'Para trabajar más rápido.'],
    ['l-help', [24, 207, 191, 32], 'Help Center', 'Centro de ayuda', 'La documentación de Elementor.'],
    ['l-exit', [24, 271, 191, 32], 'Exit to WordPress', 'Salir', 'Volver al panel de WordPress.'],
  ] },
  publicar: { shot: 'publicar', zones: [
    ['u-publish', [1239, 0, 110, 48], 'Publish', 'Publicar', 'La primera vez publica; después dice Update.'],
    ['u-options', [1349, 0, 40, 48], 'Save Options', 'Más opciones', 'Abre este desplegable.'],
    ['u-draft', [1213, 60, 172, 32], 'Save Draft', 'Guardar borrador', 'Guarda sin publicar.'],
    ['u-template', [1213, 109, 172, 32], 'Save as Template', 'Guardar como plantilla', 'Para reutilizar este diseño en otras páginas.'],
    ['u-view', [1213, 158, 172, 32], 'View Page', 'Ver página', 'Abre la página publicada.'],
  ] },
};

const CSS = `
:root{--acc:oklch(0.6204 0.195 253.83)}
.wp{background:#fff}
.wp img.shot{position:absolute;left:0;top:0;display:block}
.wp .z{position:absolute;z-index:1}
`;

for (const [name, d] of Object.entries(DEMOS)) {
  const [file, w, h, ox, oy] = SHOTS[d.shot];
  const px = ([x, y, ww, hh]) => [Math.round((x - ox) * K), Math.round((y - oy) * K), Math.round(ww * K), Math.round(hh * K)];
  // bigger zones first so smaller ones stay on top for hovering
  const sorted = [...d.zones].sort((a, b) => b[1][2] * b[1][3] - a[1][2] * a[1][3]);
  const zonesHtml = sorted.map(([id, r]) => { const [x, y, ww, hh] = px(r); return `<div class="z" data-z="${id}" style="left:${x}px;top:${y}px;width:${ww}px;height:${hh}px"></div>`; }).join('');
  const mock = `<div class="wp" id="wp"><img class="shot" src="../shots/${file}" width="${w}" height="${h}" alt="">${zonesHtml}</div>`;
  const view = d.view ? px(d.view) : [0, 0, w, h];
  const html = buildDemo({
    title: 'El editor de Elementor', mock, css: CSS,
    zones: d.zones.map(([id, , n, t, desc]) => [id, n, t, desc]),
    view, size: { w, h }, zoom: d.zoom !== false, dashicons: 'data:text/css,',
  });
  fs.mkdirSync(path.join(OUT, name), { recursive: true });
  fs.writeFileSync(path.join(OUT, name, 'index.html'), html);
}
console.log(Object.keys(DEMOS).join(' '));

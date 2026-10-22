// Generates the "Posts y Pages" demos: node scripts/generate-posts-demos.mjs public/media/wordpress/posts-pages
// HTML recreations of a clean WordPress 7.1 (English UI): the Posts/Pages lists and the block editor.
import fs from 'node:fs'; import path from 'node:path';
import { adminScreen, adminBar, buildDemo } from './lib/wp-admin-demo.mjs';
const OUT = process.argv[2];

/* ---------------------------------------------------------------- lists */

function listScreen({ type }) {
  const isPost = type === 'post';
  const views = isPost ? ['All <span class="n">(1)</span>', 'Published <span class="n">(1)</span>'] : ['All <span class="n">(2)</span>', 'Published <span class="n">(1)</span>', 'Draft <span class="n">(1)</span>'];
  const cols = isPost ? ['Title', 'Author', 'Categories', 'Tags', '<span class="dashicons dashicons-admin-comments"></span>', 'Date'] : ['Title', 'Author', '<span class="dashicons dashicons-admin-comments"></span>', 'Date'];
  const rows = isPost
    ? [{ title: 'Hello world!', state: '', actions: ['Edit', 'Quick Edit', 'Trash', 'View'], cells: ['root', '<a>Uncategorized</a>', '<span class="muted">—</span>', '<span class="bubble">1</span>'], date: 'Published<br>2026/10/22 at 6:55 am' }]
    : [
      { title: 'Privacy Policy', state: ' — Draft, Privacy Policy Page', actions: ['Edit', 'Quick Edit', 'Trash', 'Preview'], cells: ['root', '<span class="muted">—</span>'], date: 'Last Modified<br>2026/10/22 at 6:55 am' },
      { title: 'Sample Page', state: '', actions: ['Edit', 'Quick Edit', 'Trash', 'View'], cells: ['root', '<span class="muted">—</span>'], date: 'Published<br>2026/10/22 at 6:55 am' },
    ];
  const name = isPost ? 'Posts' : 'Pages';
  const main = `
    <div class="tabs"><span class="tab">Screen Options ▾</span><span class="tab">Help ▾</span></div>
    <div class="head"><h1>${name}</h1><span class="btn2" data-z="l-add">Add ${isPost ? 'Post' : 'Page'}</span></div>
    <div class="row1">
      <ul class="views" data-z="l-views">${views.map((v, i) => `<li class="${i === 0 ? 'cur' : ''}">${v}</li>`).join('<li class="pipe">|</li>')}</ul>
      <div class="search" data-z="l-search"><span class="field"></span><span class="b">Search ${name}</span></div>
    </div>
    <div class="nav">
      <div class="grp" data-z="l-bulk"><span class="sel">Bulk actions ▾</span><span class="b">Apply</span></div>
      <div class="grp" data-z="l-filter"><span class="sel">All dates ▾</span>${isPost ? '<span class="sel">All Categories ▾</span>' : ''}<span class="b">Filter</span></div>
      <div class="cnt" data-z="l-count">${isPost ? '1 item' : '2 items'}</div>
    </div>
    <table class="lt">
      <thead data-z="l-cols"><tr><th class="cb"><span class="chk"></span></th>${cols.map((c, i) => `<th class="${i === 0 ? 'ttl' : ''}">${c}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r, k) => `
        <tr${k === 0 ? ' data-z="l-row"' : ''}>
          <td class="cb"><span class="chk"${k === 0 ? ' data-z="l-check"' : ''}></span></td>
          <td class="ttl"><strong${k === 0 ? ' data-z="l-title"' : ''}><a>${r.title}</a></strong>${r.state ? `<span class="state"${!isPost && k === 0 ? ' data-z="l-state"' : ''}>${r.state}</span>` : ''}
            <div class="acts"${k === 0 ? ' data-z="l-actions"' : ''}>${r.actions.map(a => `<a class="${a === 'Trash' ? 'trash' : ''}">${a}</a>`).join(' | ')}</div></td>
          ${r.cells.map(c => `<td>${c}</td>`).join('')}
          <td${k === 0 ? ' data-z="l-date"' : ''}>${r.date}</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
  return adminScreen({ current: name, currentSub: 0, main });
}

const LIST_CSS = `
.head{display:flex;align-items:center;gap:10px;margin:6px 0 12px}
.head h1{margin:0}
.row1{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.views{list-style:none;display:flex;gap:5px;font-size:13px}
.views li{color:#3858e9}
.views li.cur{color:#1e1e1e;font-weight:600}
.views li.pipe{color:#a7aaad}
.views .n{color:#646970;font-weight:400}
.search{display:flex;gap:6px}
.field{width:170px;height:30px;border:1px solid #8c8f94;border-radius:3px;background:#fff}
.b{display:inline-flex;align-items:center;height:30px;padding:0 10px;border:1px solid #3858e9;border-radius:3px;color:#3858e9;background:#f6f7f7;font-size:13px}
.nav{display:flex;align-items:center;gap:14px;margin-bottom:8px}
.grp{display:flex;gap:6px}
.sel{display:inline-flex;align-items:center;height:30px;padding:0 24px 0 8px;border:1px solid #8c8f94;border-radius:3px;background:#fff;font-size:13px}
.cnt{margin-left:auto;color:#646970}
.lt{width:100%;border-collapse:collapse;background:#fff;border:1px solid #c3c4c7}
.lt th{text-align:left;font-weight:400;padding:8px 10px;border-bottom:1px solid #c3c4c7;color:#1e1e1e}
.lt th .dashicons{font-size:16px;width:16px;height:16px;color:#646970}
.lt td{padding:9px 10px;vertical-align:top;color:#50575e}
.lt .cb{width:34px}
.lt .ttl{width:34%}
.chk{display:inline-block;width:16px;height:16px;border:1px solid #8c8f94;border-radius:3px;background:#fff}
.lt strong a{font-size:14px;font-weight:600;text-decoration:none}
.state{color:#50575e;font-weight:600}
.acts{margin-top:4px;font-size:12px;color:#a7aaad}
.acts a{text-decoration:none}
.acts a.trash{color:#b32d2e}
.bubble{display:inline-block;min-width:22px;height:17px;padding:0 6px;border-radius:3px;background:#646970;color:#fff;font-size:11px;line-height:17px;text-align:center}
.lt tbody tr+tr td{border-top:1px solid #f0f0f1}
`;

/* --------------------------------------------------------------- editor */

const svg = {
  back: '<svg viewBox="0 0 24 24"><path d="M14.6 7l-1.2-1L8 12l5.4 6 1.2-1-4.6-5z"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M11 12.5V17.5H12.5V12.5H17.5V11H12.5V6H11V11H6V12.5H11Z"/></svg>',
  undo: '<svg viewBox="0 0 24 24"><path d="M18.3 11.7c-.6-.6-1.4-.9-2.3-.9H6.7l2.9-3.3-1.1-1-4.5 5L8.5 16l1-1-2.7-2.7H16c.5 0 .9.2 1.3.5 1 1 1 3.4 1 4.5v.3h1.5v-.2c0-1.5 0-4.3-1.5-5.7z"/></svg>',
  redo: '<svg viewBox="0 0 24 24"><path d="M15.6 6.5l-1.1 1 2.9 3.3H8c-.9 0-1.7.3-2.3.9-1.4 1.5-1.4 4.2-1.4 5.6v.2h1.5v-.3c0-1.1 0-3.5 1-4.5.3-.3.7-.5 1.3-.5h9.2L14.5 15l1.1 1.1 4.6-4.6-4.6-5z"/></svg>',
  list: '<svg viewBox="0 0 24 24"><path d="M3 6h11v1.5H3V6Zm3.5 5.5h11V13h-11v-1.5ZM21 17H10v1.5h11V17Z"/></svg>',
  ext: '<svg viewBox="0 0 24 24"><path d="M19.5 4.5h-7V6h4.44l-5.97 5.97 1.06 1.06L18 7.06v4.44h1.5v-7Zm-13 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3H17v3a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h3V5.5h-3Z"/></svg>',
  device: '<svg viewBox="0 0 24 24"><path d="M20.5 16h-.7V8c0-1.1-.9-2-2-2H6.2c-1.1 0-2 .9-2 2v8h-.7c-.8 0-1.5.7-1.5 1.5h20c0-.8-.7-1.5-1.5-1.5zM5.7 8c0-.3.2-.5.5-.5h11.6c.3 0 .5.2.5.5v7.6H5.7V8z"/></svg>',
  side: '<svg viewBox="0 0 24 24"><path d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-4 14.5H6c-.3 0-.5-.2-.5-.5V6c0-.3.2-.5.5-.5h8v13zm4.5-.5c0 .3-.2.5-.5.5h-2.5v-13H18c.3 0 .5.2.5.5v12z"/></svg>',
  more: '<svg viewBox="0 0 24 24"><path d="M13 19h-2v-2h2v2zm0-6h-2v-2h2v2zm0-6h-2V5h2v2z"/></svg>',
  para: '<svg viewBox="0 0 24 24"><path d="m9.99609 14v-.2251l.00391.0001v6.225h1.5v-14.5h2.5v14.5h1.5v-14.5h3v-1.5h-8.50391c-2.76142 0-5 2.23858-5 5 0 2.7614 2.23858 5 5 5z"/></svg>',
  drag: '<svg viewBox="0 0 24 24"><path d="M8 7h2V5H8v2zm0 6h2v-2H8v2zm0 6h2v-2H8v2zm6-14v2h2V5h-2zm0 8h2v-2h-2v2zm0 6h2v-2h-2v2z"/></svg>',
  chev: '<svg viewBox="0 0 24 24"><path d="M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z"/></svg>',
  up: '<svg viewBox="0 0 24 24"><path d="M6.5 12.4L12 8l5.5 4.4-.9 1.2L12 10l-4.5 3.6-1-1.2z"/></svg>',
  align: '<svg viewBox="0 0 24 24"><path d="M5 5.5h14V7H5V5.5zM5 17h14v1.5H5V17zm3-5.75h8v1.5H8v-1.5z"/></svg>',
  link: '<svg viewBox="0 0 24 24"><path d="M10 17.4h-.4a5.4 5.4 0 1 1 0-10.8h.4V8h-.4a3.9 3.9 0 1 0 0 7.8h.4v1.6zm4.4 0H14v-1.6h.4a3.9 3.9 0 1 0 0-7.8H14V6.6h.4a5.4 5.4 0 1 1 0 10.8zM9 11.2h6v1.6H9z"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="m21.5 9.1-6.6-6.6-4.2 5.6c-1.2-.1-2.4.1-3.6.7-.1 0-.1.1-.2.1-.5.3-.9.6-1.2.9l3.7 3.7-5.7 5.7v1.1h1.1l5.7-5.7 3.7 3.7c.4-.4.7-.8.9-1.2.1-.1.1-.2.2-.3.6-1.1.8-2.4.6-3.6l5.6-4.1z"/></svg>',
  page: '<svg viewBox="0 0 24 24"><path d="M15.5 7.5h-7V9h7V7.5Zm-7 3.5h7v1.5h-7V11Zm7 3.5h-7V16h7v-1.5Z"/><path d="M17 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm.5 14a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v12Z"/></svg>',
};

function editorScreen({ type, selected = false }) {
  const isPost = type === 'post';
  const title = isPost ? 'Hello world!' : 'Sample Page';
  const label = isPost ? 'Post' : 'Page';
  const content = isPost
    ? `<p class="blk${selected ? ' sel' : ''}" data-z="e-content">Welcome to WordPress. This is your first post. Edit or delete it, then start writing!</p>`
    : `<p class="blk" data-z="e-content">This is an example page. It's different from a blog post because it will stay in one place and will show up in your site navigation (in most themes).</p>
       <blockquote class="blk">Hi there! I'm a bike messenger by day, aspiring actor by night, and this is my website.</blockquote>`;
  const blockToolbar = selected ? `
      <div class="btb">
        <span class="g" data-z="k-type"><i>${svg.para}</i></span>
        <span class="g" data-z="k-move"><i class="sm">${svg.drag}</i><span class="ud"><i class="xs">${svg.up}</i><i class="xs">${svg.chev}</i></span></span>
        <span class="g" data-z="k-align"><i>${svg.align}</i><i>${svg.align}</i></span>
        <span class="g" data-z="k-format"><b class="t">B</b><em class="t">I</em><i>${svg.link}</i><i class="sm">${svg.chev}</i></span>
        <span class="g" data-z="k-more"><i>${svg.more}</i></span>
      </div>` : '';

  const postRows = isPost
    ? [['e-status', 'Status', '◎ Published'], ['e-publish', 'Publish', 'October 22, 2026<br>6:55 am UTC+0'], ['e-slug', 'Slug', 'hello-world'], ['e-author', 'Author', 'root'], ['e-template', 'Template', 'Single Posts'], ['e-discussion', 'Discussion', 'Open'], ['e-format', 'Format', 'Standard']]
    : [['e-status', 'Status', '◎ Published'], ['e-publish', 'Publish', 'October 22, 2026<br>6:55 am UTC+0'], ['e-slug', 'Slug', 'sample-page'], ['e-author', 'Author', 'root'], ['e-template', 'Template', 'Pages'], ['e-discussion', 'Discussion', 'Pings only'], ['e-parent', 'Parent', 'None']];

  const docSidebar = `
      <div class="card1">
        <div class="ct"><i>${isPost ? svg.pin : svg.page}</i><strong>${title}</strong><i class="sm r">${svg.more}</i></div>
        <span class="fi" data-z="e-featured">Set featured image</span>
        ${isPost ? '<a class="ex" data-z="e-excerpt">Add an excerpt…</a>' : ''}
        <p class="meta">${isPost ? '15 words' : '155 words'}, 1 minute read time.<br>Last edited 29 minutes ago.</p>
        <div class="rows">${postRows.map(([z, k, v]) => `<div class="r" data-z="${z}"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('')}</div>
        <span class="trashb">Move to trash</span>
      </div>
      ${isPost ? `<div class="pn" data-z="e-cats">Categories <i class="sm">${svg.chev}</i></div><div class="pn" data-z="e-tags">Tags <i class="sm">${svg.chev}</i></div>` : ''}`;

  const blockSidebar = `
      <div class="card1">
        <div class="ct" data-z="k-card"><i>${svg.para}</i><strong>Paragraph</strong></div>
        <p class="meta">Start with the basic building block of all narrative.</p>
        <div class="stl" data-z="k-styles"><span class="lab">Styles</span><div class="opts"><span class="on">Default</span><span>Display</span><span>Subtitle</span><span>Annotation</span></div></div>
      </div>
      <div class="pn open" data-z="k-typo">Typography <span class="sizes"><span>S</span><span class="on">M</span><span>L</span><span>XL</span><span>XXL</span></span></div>
      <div class="pn open" data-z="k-color">Color <span class="sw"><b></b><b class="bg"></b></span></div>
      <div class="pn" data-z="k-dims">Dimensions</div>
      <div class="pn">Border</div>
      <div class="pn" data-z="k-adv">Advanced <i class="sm">${svg.chev}</i></div>`;

  return `
<div class="wp" id="wp">
  ${adminBar({ viewLink: isPost ? 'View Post' : 'View Page' })}
  <div class="ehead">
    <div class="el">
      <span class="ib" data-z="e-back"><i>${svg.back}</i></span>
      <span class="ib blue" data-z="e-inserter"><i>${svg.plus}</i></span>
      <span class="grp2" data-z="e-history"><span class="ib dim"><i>${svg.undo}</i></span><span class="ib dim"><i>${svg.redo}</i></span></span>
      <span class="ib" data-z="e-overview"><i>${svg.list}</i></span>
    </div>
    <div class="docbar" data-z="e-docbar">${title} <span class="muted">· ${label}</span></div>
    <div class="er">
      <span class="grp2" data-z="e-preview"><span class="ib"><i>${svg.ext}</i></span><span class="ib"><i>${svg.device}</i></span></span>
      <span class="ib dark" data-z="e-settings"><i>${svg.side}</i></span>
      <span class="save" data-z="e-save">Save</span>
      <span class="ib" data-z="e-options"><i>${svg.more}</i></span>
    </div>
  </div>
  <div class="canvas">
    <div class="doc">
      <h1 class="ptitle" data-z="e-title">${title}</h1>
      ${blockToolbar}
      ${content}
    </div>
  </div>
  <div class="esb">
    <div class="tabs2"><span class="${selected ? '' : 'on'}" data-z="e-tab-doc">${label}</span><span class="${selected ? 'on' : ''}" data-z="e-tab-block">Block</span><span class="x">✕</span></div>
    ${selected ? blockSidebar : docSidebar}
  </div>
  <div class="efoot">${selected ? `${label} › Paragraph` : label}</div>
</div>`;
}

const EDITOR_CSS = `
.wp i{display:inline-flex;font-style:normal}
.wp svg{width:24px;height:24px;fill:currentColor}
.wp i.sm svg{width:18px;height:18px}
.wp i.xs svg{width:14px;height:14px}
.ehead{position:absolute;left:0;right:0;top:32px;height:60px;background:#fff;border-bottom:1px solid #e0e0e0;display:flex;align-items:center;justify-content:space-between;padding:0 12px}
.el,.er{display:flex;align-items:center;gap:6px}
.grp2{display:flex;gap:2px}
.ib{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:2px;color:#1e1e1e}
.ib.blue{background:#3858e9;color:#fff;width:32px;height:32px}
.ib.dark{background:#1e1e1e;color:#fff;width:32px;height:32px}
.ib.dim{color:#a7aaad}
.docbar{position:absolute;left:50%;transform:translateX(-50%);width:360px;height:36px;border-radius:4px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;gap:4px;font-size:13px}
.save{display:inline-flex;align-items:center;height:32px;padding:0 14px;border-radius:2px;background:#3858e9;color:#fff;font-size:13px;opacity:.75}
.canvas{position:absolute;left:0;top:92px;right:280px;bottom:24px;background:#fff;overflow:hidden}
.doc{width:560px;margin:46px 0 0 110px;position:relative}
.ptitle{font-size:40px;font-weight:400;letter-spacing:-.02em;margin:0 0 18px;line-height:1.15}
.blk{font-size:18px;line-height:1.55;color:#1e1e1e;margin-bottom:16px;border-radius:2px}
.blk.sel{outline:1.5px solid #3858e9;outline-offset:4px}
blockquote.blk{border-left:2px solid #1e1e1e;padding-left:18px;font-size:17px}
.btb{position:absolute;left:0;top:58px;display:flex;background:#fff;border:1px solid #1e1e1e;border-radius:2px;height:46px;z-index:2}
.btb .g{display:flex;align-items:center;gap:2px;padding:0 6px;border-right:1px solid #1e1e1e}
.btb .g:last-child{border-right:0}
.btb .ud{display:flex;flex-direction:column}
.btb .t{display:inline-flex;align-items:center;justify-content:center;width:26px;font-size:16px;color:#1e1e1e}
.btb .t:is(em){font-family:Georgia,serif}
.doc:has(.btb) .blk.sel{margin-top:70px}
.esb{position:absolute;right:0;top:92px;bottom:24px;width:280px;background:#fff;border-left:1px solid #e0e0e0;overflow:hidden}
.tabs2{display:flex;align-items:center;gap:18px;height:48px;padding:0 16px;border-bottom:1px solid #e0e0e0;font-size:13px}
.tabs2 span{height:100%;display:flex;align-items:center}
.tabs2 .on{box-shadow:inset 0 -2px #3858e9;font-weight:500}
.tabs2 .x{margin-left:auto}
.card1{padding:16px;border-bottom:1px solid #e0e0e0;display:flex;flex-direction:column;gap:10px}
.ct{display:flex;align-items:center;gap:8px;font-size:13px}
.ct .r{margin-left:auto}
.fi{display:flex;align-items:center;justify-content:center;height:40px;border:1px solid #949494;border-radius:2px;font-size:13px;font-weight:500}
.ex{font-size:13px;color:#3858e9}
.meta{font-size:12px;color:#757575;line-height:1.5}
.rows{display:flex;flex-direction:column;gap:2px}
.r{display:grid;grid-template-columns:96px 1fr;align-items:start;padding:5px 0;font-size:13px}
.r .k{color:#1e1e1e}
.r .v{color:#3858e9}
.trashb{display:flex;align-items:center;justify-content:center;height:36px;border:1px solid #cc1818;color:#cc1818;border-radius:2px;font-size:13px;margin-top:4px}
.pn{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #e0e0e0;font-size:13px;font-weight:500}
.pn.open{flex-wrap:wrap;gap:10px}
.sizes{display:flex;gap:4px;font-weight:400}
.sizes span{padding:3px 6px;border:1px solid #ddd;border-radius:2px;font-size:11px}
.sizes .on{background:#1e1e1e;color:#fff;border-color:#1e1e1e}
.sw{display:flex;gap:4px}
.sw b{width:18px;height:18px;border-radius:50%;background:#1e1e1e;border:1px solid #ddd}
.sw b.bg{background:linear-gradient(135deg,#fff 45%,#cc1818 50%,#fff 55%)}
.stl{display:flex;flex-direction:column;gap:8px}
.lab{font-size:11px;text-transform:uppercase;font-weight:500}
.opts{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.opts span{border:1px solid #ddd;border-radius:2px;padding:8px;text-align:center;font-size:12px}
.opts .on{outline:1.5px solid #3858e9}
.efoot{position:absolute;left:0;right:0;bottom:0;height:24px;border-top:1px solid #e0e0e0;background:#fff;font-size:12px;display:flex;align-items:center;padding:0 16px}
`;

/* ---------------------------------------------------------------- demos */

const DEMOS = {
  'lista-posts': {
    mock: listScreen({ type: 'post' }), css: LIST_CSS, title: 'Posts',
    zones: [
      ['l-add', 'Add Post', 'Añadir entrada', 'Crea una entrada nueva.'],
      ['l-views', 'All | Published', 'Estados', 'Cuántas hay de cada estado. Haz clic para filtrar.'],
      ['l-search', 'Search Posts', 'Buscar entradas', 'Busca por palabras del título o del contenido.'],
      ['l-bulk', 'Bulk actions', 'Acciones en lote', 'Aplica una acción a todas las marcadas a la vez.'],
      ['l-filter', 'Filter', 'Filtrar', 'Muestra solo las de un mes o una categoría.'],
      ['l-count', '1 item', 'Total', 'Cuántas entradas hay en la lista.'],
      ['l-cols', 'Columns', 'Columnas', 'Título, autor, categorías, etiquetas, comentarios y fecha.'],
      ['l-check', 'Checkbox', 'Casilla', 'Marca una o varias para las acciones en lote.'],
      ['l-title', 'Hello world!', 'Título', 'Haz clic para abrirla en el editor.'],
      ['l-actions', 'Edit | Quick Edit | Trash | View', 'Acciones', 'Aparecen al pasar el ratón por la fila.'],
      ['l-date', 'Date', 'Fecha', 'Cuándo se publicó y su estado.'],
    ],
    view: [160, 32, 940, 330], size: { w: 1100, h: 640 },
  },
  'lista-pages': {
    mock: listScreen({ type: 'page' }), css: LIST_CSS, title: 'Pages',
    zones: [
      ['l-add', 'Add Page', 'Añadir página', 'Crea una página nueva.'],
      ['l-views', 'All | Published | Draft', 'Estados', 'Aquí ya hay una página en borrador.'],
      ['l-cols', 'Columns', 'Columnas', 'Sin categorías ni etiquetas: las páginas no las usan.'],
      ['l-title', 'Privacy Policy', 'Política de privacidad', 'WordPress la crea en borrador para que la completemos.'],
      ['l-state', '— Draft', 'Estado', 'Junto al título se indica si no está publicada.'],
      ['l-actions', 'Edit | Quick Edit | Trash | Preview', 'Acciones', 'En un borrador, Preview en lugar de View.'],
    ],
    view: [160, 32, 940, 330], size: { w: 1100, h: 640 },
  },
  'editor-post': {
    mock: editorScreen({ type: 'post' }), css: EDITOR_CSS, title: 'Editor de entradas',
    zones: [
      ['e-title', 'Title', 'Título', 'El nombre de la entrada.'],
      ['e-content', 'Content', 'Contenido', 'El texto, hecho con bloques.'],
      ['e-featured', 'Set featured image', 'Imagen destacada', 'La imagen que representa a la entrada.'],
      ['e-excerpt', 'Add an excerpt…', 'Extracto', 'Un resumen corto para los listados.'],
      ['e-status', 'Status', 'Estado', 'Publicada, borrador, pendiente o privada.'],
      ['e-publish', 'Publish', 'Fecha de publicación', 'Si es futura, la entrada se programa.'],
      ['e-slug', 'Slug', 'Slug', 'El final de su dirección: /hello-world/'],
      ['e-author', 'Author', 'Autor', 'Quién firma la entrada.'],
      ['e-template', 'Template', 'Plantilla', 'El diseño del tema con el que se muestra.'],
      ['e-discussion', 'Discussion', 'Comentarios', 'Si se permiten comentarios.'],
      ['e-format', 'Format', 'Formato', 'Estándar, galería, cita… según el tema.'],
      ['e-cats', 'Categories', 'Categorías', 'Los temas generales a los que pertenece.'],
      ['e-tags', 'Tags', 'Etiquetas', 'Palabras clave más concretas.'],
    ],
    view: [0, 92, 1100, 524], size: { w: 1100, h: 640 },
  },
  'editor-page': {
    mock: editorScreen({ type: 'page' }), css: EDITOR_CSS, title: 'Editor de páginas',
    zones: [
      ['e-title', 'Title', 'Título', 'El nombre de la página.'],
      ['e-content', 'Content', 'Contenido', 'El mismo editor de bloques que en las entradas.'],
      ['e-featured', 'Set featured image', 'Imagen destacada', 'También existe en las páginas.'],
      ['e-slug', 'Slug', 'Slug', 'El final de su dirección: /sample-page/'],
      ['e-template', 'Template', 'Plantilla', 'Las páginas usan la plantilla Pages.'],
      ['e-discussion', 'Discussion', 'Comentarios', 'En las páginas suelen estar cerrados.'],
      ['e-parent', 'Parent', 'Página padre', 'Novedad: la página puede colgar de otra.'],
    ],
    view: [0, 92, 1100, 524], size: { w: 1100, h: 640 },
  },
  'editor-barra': {
    mock: editorScreen({ type: 'post' }), css: EDITOR_CSS, title: 'Barra del editor',
    zones: [
      ['e-back', 'View Posts', 'Volver', 'Regresa a la lista de entradas.'],
      ['e-inserter', 'Block Inserter', 'Añadir bloque', 'Abre la biblioteca de bloques.'],
      ['e-history', 'Undo · Redo', 'Deshacer · Rehacer', 'Vuelve atrás o adelante en los cambios.'],
      ['e-overview', 'Document Overview', 'Vista general', 'Todos los bloques en forma de lista.'],
      ['e-docbar', 'Hello world! · Post', 'Documento', 'Qué estamos editando.'],
      ['e-preview', 'View · Preview', 'Ver · Previsualizar', 'Mírala antes de publicar, en ordenador o móvil.'],
      ['e-settings', 'Settings', 'Ajustes', 'Muestra u oculta la barra lateral.'],
      ['e-save', 'Save / Publish', 'Guardar / Publicar', 'Publica o guarda los cambios.'],
      ['e-options', 'Options', 'Opciones', 'Más opciones del editor.'],
    ],
    view: [0, 32, 1100, 360], size: { w: 1100, h: 640 },
  },
  bloque: {
    mock: editorScreen({ type: 'post', selected: true }), css: EDITOR_CSS, title: 'Un bloque',
    zones: [
      ['e-content', 'Paragraph', 'Bloque seleccionado', 'Al hacer clic en un bloque, se selecciona.'],
      ['k-type', 'Paragraph', 'Tipo de bloque', 'Lo transforma en otro: título, lista, cita…'],
      ['k-move', 'Drag · Move', 'Mover', 'Arrastra el bloque o súbelo y bájalo.'],
      ['k-align', 'Align', 'Alinear', 'Alineación del bloque y del texto.'],
      ['k-format', 'Bold · Italic · Link', 'Formato', 'Negrita, cursiva, enlaces y más.'],
      ['k-more', 'Options', 'Opciones', 'Duplicar, eliminar, copiar…'],
      ['e-tab-block', 'Block', 'Pestaña Bloque', 'Los ajustes del bloque seleccionado.'],
      ['k-styles', 'Styles', 'Estilos', 'Variaciones de diseño que trae el tema.'],
      ['k-typo', 'Typography', 'Tipografía', 'El tamaño del texto.'],
      ['k-color', 'Color', 'Color', 'Color del texto y del fondo.'],
      ['k-adv', 'Advanced', 'Avanzado', 'Opciones extra, como añadir una clase CSS.'],
    ],
    view: [0, 92, 1100, 524], size: { w: 1100, h: 640 },
  },
};

for (const [name, demo] of Object.entries(DEMOS)) {
  fs.mkdirSync(path.join(OUT, name), { recursive: true });
  fs.writeFileSync(path.join(OUT, name, 'index.html'), buildDemo(demo));
}
console.log(Object.keys(DEMOS).join(' '));

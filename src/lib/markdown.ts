import {nothing} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {marked} from 'marked';
import hljs from 'highlight.js/lib/common';
import DOMPurify from 'dompurify';

/**
 * Markdown → HTML pipeline:
 *   marked (GFM + breaks) → highlight.js → DOMPurify.
 *
 * DOMPurify is configured with an explicit allowlist of tags/attrs so that even
 * if published content is tampered with, we render a plain document.
 * All generated markup passes through sanitize() before being handed to
 * lit's `unsafeHTML` directive.
 */

const ALLOWED_TAGS = [
  'a',
  'abbr',
  'b',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'kbd',
  'li',
  'mark',
  'ol',
  'p',
  'pre',
  'q',
  's',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'u',
  'ul'
];

const ALLOWED_ATTR = ['href', 'title', 'alt', 'src', 'class', 'target', 'rel', 'start', 'type'];

const ALLOWED_URI_REGEXP = /^(?:(?:https?|mailto|tel):|#|\/|\.\/|\.\.\/)/i;

const markedRenderer = new marked.Renderer();
markedRenderer.code = ({text, lang}) => {
  const language = (lang || '').trim().split(/\s+/)[0] || '';
  let highlighted = text;

  try {
    if (language && hljs.getLanguage(language)) {
      highlighted = hljs.highlight(text, {language}).value;
    } else {
      highlighted = hljs.highlightAuto(text).value;
    }
  } catch {
    highlighted = text;
  }

  return `<pre><code class="hljs ${language ? `language-${language}` : 'language-plain'}">${highlighted}</code></pre>`;
};

marked.setOptions({gfm: true, breaks: true, renderer: markedRenderer});

// Force every generated <a> to be safe when it opens a new tab.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (!(node instanceof HTMLElement)) return;
  if (node.tagName === 'A' && node.hasAttribute('target')) {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

function sanitize(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP,
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['style', 'on*' as unknown as string],
    KEEP_CONTENT: true,
    ALLOW_DATA_ATTR: false
  });
}

export function renderMarkdown(markdown = '') {
  if (!markdown.trim()) return nothing;
  const raw = marked.parse(markdown) as string;
  return unsafeHTML(sanitize(raw));
}

import {nothing} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {marked} from 'marked';
import hljs from 'highlight.js/lib/common';

const markedRenderer = new marked.Renderer();
markedRenderer.code = ({text, lang}) => {
  const language = (lang || '').trim().split(/\s+/)[0] || '';
  let highlighted = text;

  try {
    if (language && hljs.getLanguage(language)) highlighted = hljs.highlight(text, {language}).value;
    else highlighted = hljs.highlightAuto(text).value;
  } catch {
    highlighted = text;
  }

  return `<pre><code class="hljs ${language ? `language-${language}` : 'language-plain'}">${highlighted}</code></pre>`;
};

marked.setOptions({gfm: true, breaks: true, renderer: markedRenderer});

export function renderMarkdown(markdown = '') {
  if (!markdown.trim()) return nothing;
  return unsafeHTML(marked.parse(markdown) as string);
}

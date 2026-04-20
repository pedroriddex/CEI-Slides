import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import type {Direction, ListItem, MagicBoxProps, SlideDocument} from '../../lib/types';
import {resolveSvgAssetPath} from '../../lib/assets';
import {hasText, validIcons, validLinks, validNumberedItems} from '../../lib/content-helpers';
import {createPhasedItems, iconItemKey, linkItemKey, listItemKey, resolveSelectivePhase} from '../../lib/slide-transition';
import {renderMarkdown} from '../../lib/markdown';
import './motion-auto-size';
import './slide-links';
import './icon-list';

@customElement('magic-box')
export class MagicBox extends LitElement implements MagicBoxProps {
  @property({attribute: false}) slide!: SlideDocument;
  @property({type: String}) slug = '';
  @property({type: String}) tone: 'surface' | 'block' = 'block';
  @property({attribute: false}) comparisonSlide: SlideDocument | null = null;
  @property({type: String}) bodyPhase: 'idle' | 'out' | 'in' = 'idle';
  @property({type: Boolean}) motionActive = false;
  @property({type: String}) direction: Direction = 'forward';

  protected createRenderRoot() {
    return this;
  }

  private renderMagicList(items: ReturnType<typeof createPhasedItems<ListItem>>) {
    const listType = this.slide.mgListType || 'bullet';
    if (!items.length) return nothing;

    return html`
      <motion-auto-size
        inner-class="magicbox__list slide-motion-shell slide-motion-shell--${resolveSelectivePhase(this.bodyPhase, items.map((entry) => entry.key), (this.comparisonSlide?.mgListItems || []).map((entry) => listItemKey(entry)))} slide-motion-shell--${this.direction}"
        .active=${this.motionActive || items.some((entry) => entry.phase !== 'idle')}
        .content=${html`
          ${repeat(
            items,
            (entry) => entry.key,
            (entry, index) => html`
              <div data-flow-key=${entry.key} class="magicbox__list-item magicbox__list-item--${listType} slide-motion-shell slide-motion-shell--${entry.phase} slide-motion-shell--${this.direction}">
                ${listType === 'numbered'
                  ? html`<span class="magicbox__list-marker">${entry.item.num || index + 1}</span>`
                  : html`<span class="magicbox__list-marker"></span>`}
                <div class="magicbox__list-copy">
                  ${entry.item.title ? html`<span class="magicbox__list-title">${entry.item.title}</span>` : nothing}
                  ${entry.item.description ? html`<span class="magicbox__list-description">${entry.item.description}</span>` : nothing}
                </div>
              </div>
            `
          )}
        `}
      ></motion-auto-size>
    `;
  }

  render() {
    const slide = this.slide;
    const comparison = this.comparisonSlide;
    const markdown = (slide.mgContent || '').trim();
    const logoSrc = resolveSvgAssetPath(this.slug, slide.mgLogo);
    const comparisonLogoSrc = comparison ? resolveSvgAssetPath(this.slug, comparison.mgLogo) : null;
    const links = createPhasedItems(this.bodyPhase, validLinks(slide.mgLinksList || []), validLinks(comparison?.mgLinksList || []), linkItemKey);
    const icons = createPhasedItems(this.bodyPhase, validIcons(slide.mgIconList || []), validIcons(comparison?.mgIconList || []), iconItemKey);
    const listItems = createPhasedItems(this.bodyPhase, validNumberedItems(slide.mgListItems || []), validNumberedItems(comparison?.mgListItems || []), listItemKey);
    const hasMeta = Boolean(logoSrc || hasText(slide.mgUrlTitle) || hasText(slide.mgUrl));
    const hasCode = Boolean(hasText(slide.mgCode) && markdown);
    const hasAnything = Boolean(markdown || hasText(slide.mgTitle) || hasMeta || links.length || icons.length || listItems.length);

    if (!hasAnything) return nothing;

    const metaPhase = resolveSelectivePhase(
      this.bodyPhase,
      {logoSrc, mgUrlTitle: slide.mgUrlTitle || '', mgUrl: slide.mgUrl || ''},
      {logoSrc: comparisonLogoSrc, mgUrlTitle: comparison?.mgUrlTitle || '', mgUrl: comparison?.mgUrl || ''}
    );
    const titlePhase = resolveSelectivePhase(this.bodyPhase, slide.mgTitle || '', comparison?.mgTitle || '');
    const plainContentPhase = resolveSelectivePhase(this.bodyPhase, markdown, comparison?.mgContent || '');
    const codeShellPhase = resolveSelectivePhase(
      this.bodyPhase,
      {mgCode: slide.mgCode || '', mgContent: markdown},
      {mgCode: comparison?.mgCode || '', mgContent: comparison?.mgContent || ''}
    );

    return html`
      <motion-auto-size
        outer-class="magicbox ${this.tone === 'block' ? 'magicbox--block' : ''}"
        inner-class="magicbox__inner"
        .active=${this.motionActive}
        .content=${html`
          ${hasMeta
            ? html`
                <div data-flow-key="meta" class="magicbox__meta slide-motion-shell slide-motion-shell--${metaPhase} slide-motion-shell--${this.direction}">
                  ${logoSrc ? html`<img class="magicbox__favicon" src=${logoSrc} alt=${slide.mgTitle || slide.mgUrlTitle || 'Logo'} />` : nothing}
                  ${(slide.mgUrlTitle || slide.mgUrl)
                    ? html`
                        <div class="magicbox__meta-copy">
                          ${slide.mgUrlTitle ? html`<span class="magicbox__site">${slide.mgUrlTitle}</span>` : nothing}
                          ${slide.mgUrl ? html`<a target="_blank" href=${slide.mgUrl} class="magicbox__url" rel="noreferrer">${slide.mgUrl}</a>` : nothing}
                        </div>
                      `
                    : nothing}
                  <span class="magicbox__meta-spacer"></span>
                  <i class="ri-more-2-line magicbox__menu"></i>
                </div>
              `
            : nothing}

          ${slide.mgTitle
            ? html`
                <div data-flow-key="title">
                  <h2 class="magicbox__title slide-motion-shell slide-motion-shell--${titlePhase} slide-motion-shell--${this.direction}">${slide.mgTitle}</h2>
                </div>
              `
            : nothing}

          ${markdown
            ? hasCode
              ? html`
                  <div data-flow-key="content">
                    <div class="magicbox__code slide-motion-shell slide-motion-shell--${codeShellPhase} slide-motion-shell--${this.direction}">
                      <span class="magicbox__badge">${slide.mgCode}</span>
                      <div class="magicbox__content">${renderMarkdown(markdown)}</div>
                    </div>
                  </div>
                `
              : html`
                  <div data-flow-key="content">
                    <div class="magicbox__content slide-motion-shell slide-motion-shell--${plainContentPhase} slide-motion-shell--${this.direction}">${renderMarkdown(markdown)}</div>
                  </div>
                `
            : nothing}

          ${links.length ? html`<div data-flow-key="links"><slide-links-block .links=${links} .magic=${true} .motionActive=${this.motionActive} .direction=${this.direction}></slide-links-block></div>` : nothing}
          ${icons.length
            ? html`
                <div data-flow-key="icons">
                  <icon-list-block
                    .items=${icons}
                    .separator=${Boolean(slide.mgIconListSeparator)}
                    .spaced=${Boolean(slide.mgIconListSpace)}
                    .magic=${true}
                    .motionActive=${this.motionActive}
                    .direction=${this.direction}
                  ></icon-list-block>
                </div>
              `
            : nothing}
          ${listItems.length ? html`<div data-flow-key="list">${this.renderMagicList(listItems)}</div>` : nothing}
        `}
      ></motion-auto-size>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'magic-box': MagicBox;
  }
}

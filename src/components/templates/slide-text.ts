import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {ContentPhase, Direction, SlideDocument, SlideTemplateProps} from '../../lib/types';
import {hasText, validBulletItems, validLinks, validNumberedItems} from '../../lib/content-helpers';
import {bulletListItemKey, createPhasedItems, linkItemKey, listItemKey, resolveSelectivePhase} from '../../lib/slide-transition';
import '../blocks/motion-auto-size';
import '../blocks/slide-heading';
import '../blocks/number-list';
import '../blocks/normal-list';
import '../blocks/slide-links';

@customElement('slide-text-template')
export class SlideTextTemplate extends LitElement implements SlideTemplateProps {
  @property({attribute: false}) slide!: SlideDocument;
  @property({type: String}) slug = '';
  @property({attribute: false}) comparisonSlide: SlideDocument | null = null;
  @property({type: String}) bodyPhase: ContentPhase = 'idle';
  @property({type: Boolean}) motionActive = false;
  @property({type: String}) direction: Direction = 'forward';

  protected createRenderRoot() {
    return this;
  }

  private renderDownload(downloadPhase: ContentPhase) {
    if (!this.slide.download || !this.slide.downloadLink) return nothing;

    return html`
      <div class="slide-links slide-motion-shell slide-motion-shell--${downloadPhase} slide-motion-shell--${this.direction}">
        <a href=${this.slide.downloadLink} download class="slide-links__item">
          <i class="ri-download-line slide-links__icon"></i>
          Descargar proyecto de ejemplo
        </a>
      </div>
    `;
  }

  render() {
    const slide = this.slide;
    const comparison = this.comparisonSlide;
    const numberItems = createPhasedItems(this.bodyPhase, validNumberedItems(slide.listItems || []), validNumberedItems(comparison?.listItems || []), listItemKey);
    const bulletItems = createPhasedItems(this.bodyPhase, validBulletItems(slide.list || []), validBulletItems(comparison?.list || []), bulletListItemKey);
    const links = createPhasedItems(this.bodyPhase, validLinks(slide.linksList || []), validLinks(comparison?.linksList || []), linkItemKey);
    const hasBody = hasText(slide.description) || numberItems.length || bulletItems.length || Boolean(slide.download && slide.downloadLink) || links.length;
    const descriptionPhase = resolveSelectivePhase(this.bodyPhase, slide.description || '', comparison?.description || '');
    const downloadPhase = resolveSelectivePhase(
      this.bodyPhase,
      {download: Boolean(slide.download), downloadLink: slide.downloadLink || ''},
      {download: Boolean(comparison?.download), downloadLink: comparison?.downloadLink || ''}
    );
    const titlePhase = resolveSelectivePhase(this.bodyPhase, slide.title || '', comparison?.title || '');
    const iconPhase = resolveSelectivePhase(this.bodyPhase, slide.icon || '', comparison?.icon || '');

    return html`
      <div class="slide-text">
        <div class="slide-text__content">
          ${hasText(slide.title) || hasText(slide.icon)
            ? html`<slide-heading-block .headingTitle=${slide.title || ''} .icon=${slide.icon || null} kind="section" .titlePhase=${titlePhase} .iconPhase=${iconPhase} .direction=${this.direction}></slide-heading-block>`
            : nothing}
          ${hasBody
            ? html`
                <motion-auto-size
                  outer-class="slide-text__body"
                  inner-class="slide-text__body-inner"
                  .active=${this.motionActive}
                  .content=${html`
                    ${slide.description
                      ? html`
                          <div data-flow-key="description">
                            <p class="slide-body slide-motion-shell slide-motion-shell--${descriptionPhase} slide-motion-shell--${this.direction}">${slide.description}</p>
                          </div>
                        `
                      : nothing}
                    ${numberItems.length
                      ? html`<div data-flow-key="number-list"><number-list-block .items=${numberItems} .motionActive=${this.motionActive} .direction=${this.direction}></number-list-block></div>`
                      : nothing}
                    ${bulletItems.length
                      ? html`<div data-flow-key="bullet-list"><normal-list-block .items=${bulletItems} .motionActive=${this.motionActive} .direction=${this.direction}></normal-list-block></div>`
                      : nothing}
                    ${slide.download && slide.downloadLink
                      ? html`<div data-flow-key="download">${this.renderDownload(downloadPhase)}</div>`
                      : nothing}
                    ${links.length
                      ? html`<div data-flow-key="links"><slide-links-block .links=${links} .motionActive=${this.motionActive} .direction=${this.direction}></slide-links-block></div>`
                      : nothing}
                  `}
                ></motion-auto-size>
              `
            : nothing}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'slide-text-template': SlideTextTemplate;
  }
}

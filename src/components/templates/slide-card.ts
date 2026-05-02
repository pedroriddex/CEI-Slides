import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {ContentPhase, Direction, SlideDocument, SlideTemplateProps} from '../../lib/types';
import {getMagicBox, hasMagicBoxContent, hasText, validBulletItems, validIcons, validNumberedItems} from '../../lib/content-helpers';
import {resolveAssetPath, resolveSvgAssetPath} from '../../lib/assets';
import {bulletListItemKey, createPhasedItems, iconItemKey, listItemKey, resolveSelectivePhase} from '../../lib/slide-transition';
import '../blocks/motion-auto-size';
import '../blocks/slide-heading';
import '../blocks/number-list';
import '../blocks/normal-list';
import '../blocks/icon-list';
import '../blocks/magic-box';

@customElement('slide-card-template')
export class SlideCardTemplate extends LitElement implements SlideTemplateProps {
  @property({attribute: false}) slide!: SlideDocument;
  @property({type: String}) slug = '';
  @property({attribute: false}) comparisonSlide: SlideDocument | null = null;
  @property({type: String}) bodyPhase: ContentPhase = 'idle';
  @property({type: Boolean}) motionActive = false;
  @property({type: String}) direction: Direction = 'forward';

  protected createRenderRoot() {
    return this;
  }

  render() {
    const slide = this.slide;
    const comparison = this.comparisonSlide;
    const isPresentation = slide.subtemplate === 'presentation';
    const avatarSrc = isPresentation ? resolveAssetPath(this.slug, slide.coverImg) : '';
    const numberItems = createPhasedItems(this.bodyPhase, validNumberedItems(slide.listItems || []), validNumberedItems(comparison?.listItems || []), listItemKey);
    const bulletItems = createPhasedItems(this.bodyPhase, validBulletItems(slide.list || []), validBulletItems(comparison?.list || []), bulletListItemKey);
    const icons = createPhasedItems(this.bodyPhase, validIcons(slide.iconList || []), validIcons(comparison?.iconList || []), iconItemKey);
    const magic = getMagicBox(slide);
    const logoSrc = resolveSvgAssetPath(this.slug, magic.logo);
    const hasMagic = hasMagicBoxContent(slide, logoSrc);
    const hasBody = hasText(slide.description) || hasText(slide.postDescription) || numberItems.length || bulletItems.length || icons.length || hasMagic;
    const titlePhase = resolveSelectivePhase(this.bodyPhase, slide.title || '', comparison?.title || '');
    const iconPhase = resolveSelectivePhase(this.bodyPhase, slide.icon || '', comparison?.icon || '');
    const descriptionPhase = resolveSelectivePhase(this.bodyPhase, slide.description || '', comparison?.description || '');
    const postDescriptionPhase = resolveSelectivePhase(this.bodyPhase, slide.postDescription || '', comparison?.postDescription || '');

    return html`
      <div class="slide-card ${isPresentation ? 'slide-card--presentation' : ''}">
        ${isPresentation && avatarSrc ? html`<img class="slide-card__avatar" src=${avatarSrc} alt="">` : nothing}
        <div class="slide-card__content">
          ${hasText(slide.title) || hasText(slide.icon)
            ? html`<slide-heading-block .headingTitle=${slide.title || ''} .icon=${slide.icon || null} kind="panel" .titlePhase=${titlePhase} .iconPhase=${iconPhase} .direction=${this.direction}></slide-heading-block>`
            : nothing}
          ${hasBody
            ? html`
                <motion-auto-size
                  outer-class="slide-card__body"
                  inner-class="slide-card__body-inner"
                  .active=${this.motionActive}
                  .content=${html`
                    ${slide.description
                      ? html`
                          <div data-flow-key="description">
                            <p class="slide-body slide-motion-shell slide-motion-shell--${descriptionPhase} slide-motion-shell--${this.direction}">${slide.description}</p>
                          </div>
                        `
                      : nothing}
                    ${slide.postDescription
                      ? html`
                          <div data-flow-key="post-description">
                            <p class="slide-body slide-motion-shell slide-motion-shell--${postDescriptionPhase} slide-motion-shell--${this.direction}">${slide.postDescription}</p>
                          </div>
                        `
                      : nothing}
                    ${numberItems.length
                      ? html`<div data-flow-key="number-list"><number-list-block .items=${numberItems} .motionActive=${this.motionActive} .direction=${this.direction}></number-list-block></div>`
                      : nothing}
                    ${bulletItems.length
                      ? html`<div data-flow-key="bullet-list"><normal-list-block .items=${bulletItems} .motionActive=${this.motionActive} .direction=${this.direction}></normal-list-block></div>`
                      : nothing}
                    ${icons.length
                      ? html`<div data-flow-key="icon-list"><icon-list-block .items=${icons} .motionActive=${this.motionActive} .direction=${this.direction}></icon-list-block></div>`
                      : nothing}
                    ${hasMagic
                      ? html`
                          <div data-flow-key="magic-box">
                            <magic-box .slide=${slide} .slug=${this.slug} tone="block" .comparisonSlide=${comparison} .bodyPhase=${this.bodyPhase} .motionActive=${this.motionActive} .direction=${this.direction}></magic-box>
                          </div>
                        `
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
    'slide-card-template': SlideCardTemplate;
  }
}

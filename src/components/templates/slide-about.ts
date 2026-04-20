import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {ContentPhase, Direction, SlideDocument, SlideTemplateProps} from '../../lib/types';
import {resolveAssetPath} from '../../lib/assets';
import {hasText, validIcons} from '../../lib/content-helpers';
import {createPhasedItems, iconItemKey, resolveSelectivePhase} from '../../lib/slide-transition';
import '../blocks/motion-auto-size';
import '../blocks/icon-list';

@customElement('slide-about-template')
export class SlideAboutTemplate extends LitElement implements SlideTemplateProps {
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
    const imageSrc = resolveAssetPath(this.slug, slide.image);
    const icons = createPhasedItems(this.bodyPhase, validIcons(slide.iconList || []), validIcons(comparison?.iconList || []), iconItemKey);
    const hasCopy = Boolean((slide.description || '').trim() || icons.length);
    const avatarPhase = resolveSelectivePhase(this.bodyPhase, slide.image || '', comparison?.image || '');
    const titlePhase = resolveSelectivePhase(this.bodyPhase, slide.title || '', comparison?.title || '');
    const descriptionPhase = resolveSelectivePhase(this.bodyPhase, slide.description || '', comparison?.description || '');

    return html`
      <div class="slide-about">
        ${imageSrc
          ? html`
              <div class="slide-about__media slide-motion-shell slide-motion-shell--${avatarPhase} slide-motion-shell--${this.direction}">
                <img class="slide-about__avatar" src=${imageSrc} alt=${slide.title || ''} />
              </div>
            `
          : nothing}

        ${slide.title ? html`<h3 class="slide-panel__title slide-about__title slide-motion-shell slide-motion-shell--${titlePhase} slide-motion-shell--${this.direction}">${slide.title}</h3>` : nothing}

        ${hasCopy
          ? html`
              <motion-auto-size
                outer-class="slide-about__copy"
                inner-class="slide-about__copy-inner"
                .active=${this.motionActive}
                .content=${html`
                  ${slide.description
                    ? html`
                        <div data-flow-key="description">
                          <p class="slide-body slide-about__description slide-motion-shell slide-motion-shell--${descriptionPhase} slide-motion-shell--${this.direction}">${slide.description}</p>
                        </div>
                      `
                    : nothing}
                  ${icons.length
                    ? html`
                        <div data-flow-key="icons">
                          <div class="slide-about__icons" aria-label="Tecnologías">
                            <icon-list-block .items=${icons} .motionActive=${this.motionActive} .direction=${this.direction}></icon-list-block>
                          </div>
                        </div>
                      `
                    : nothing}
                `}
              ></motion-auto-size>
            `
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'slide-about-template': SlideAboutTemplate;
  }
}

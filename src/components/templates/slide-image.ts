import {LitElement, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {ContentPhase, Direction, SlideDocument, SlideTemplateProps} from '../../lib/types';
import {resolveAssetPath, resolveIframePath} from '../../lib/assets';
import {hasText} from '../../lib/content-helpers';
import {resolveSelectivePhase} from '../../lib/slide-transition';
import '../blocks/slide-heading';
import '../blocks/slide-image-copy-motion';
import '../blocks/media-lightbox';

@customElement('slide-image-template')
export class SlideImageTemplate extends LitElement implements SlideTemplateProps {
  @property({attribute: false}) slide!: SlideDocument;
  @property({type: String}) slug = '';
  @property({attribute: false}) comparisonSlide: SlideDocument | null = null;
  @property({type: String}) bodyPhase: ContentPhase = 'idle';
  @property({type: Boolean}) motionActive = false;
  @property({type: String}) direction: Direction = 'forward';
  @state() private isLightboxOpen = false;

  protected createRenderRoot() {
    return this;
  }

  render() {
    const slide = this.slide;
    const comparison = this.comparisonSlide;
    const imageSrc = resolveAssetPath(this.slug, slide.image);
    const iframeSrc = resolveIframePath(this.slug, slide.iframe);
    const hasMedia = Boolean(imageSrc || iframeSrc);
    const hasDescriptionSlot = Boolean((slide.description || '').trim() || (comparison?.description || '').trim());
    const titlePhase = resolveSelectivePhase(this.bodyPhase, slide.title || '', comparison?.title || '');
    const iconPhase = resolveSelectivePhase(this.bodyPhase, slide.icon || '', comparison?.icon || '');
    const mediaPhase = resolveSelectivePhase(this.bodyPhase, {image: slide.image || '', iframe: slide.iframe || ''}, {image: comparison?.image || '', iframe: comparison?.iframe || ''});

    return html`
      <div class="slide-image ${hasMedia ? 'slide-image--with-media' : ''}">
        <div class="slide-image__content">
          ${(hasText(slide.title) || hasText(slide.icon))
            ? html`<slide-heading-block .headingTitle=${slide.title || ''} .icon=${slide.icon || null} kind="section" .titlePhase=${titlePhase} .iconPhase=${iconPhase} .direction=${this.direction}></slide-heading-block>`
            : nothing}
          ${hasDescriptionSlot
            ? html`
                <slide-image-copy-motion
                  class="slide-image__copy-region"
                  .description=${slide.description || ''}
                  .comparisonDescription=${comparison?.description || ''}
                  .bodyPhase=${this.bodyPhase}
                  .active=${this.motionActive}
                ></slide-image-copy-motion>
              `
            : nothing}
          ${hasMedia
            ? html`
                <div class="slide-image__media-region">
                  <div class="slide-image__media-frame">
                    ${imageSrc
                      ? html`
                          <button class="slide-image__media-trigger slide-motion-shell slide-motion-shell--${mediaPhase} slide-motion-shell--${this.direction}" type="button" @click=${() => (this.isLightboxOpen = true)} aria-label="Ampliar imagen">
                            <img class="slide-image__media" src=${imageSrc} alt=${slide.title || ''} />
                            <span class="slide-image__media-overlay" aria-hidden="true">
                              <i class="ri-search-eye-line slide-image__media-icon"></i>
                            </span>
                          </button>
                        `
                      : nothing}
                    ${iframeSrc
                      ? html`
                          <iframe title=${slide.title || 'iframe'} class="slide-image__media slide-motion-shell slide-motion-shell--${mediaPhase} slide-motion-shell--${this.direction}" src=${iframeSrc}></iframe>
                        `
                      : nothing}
                  </div>
                </div>
              `
            : nothing}
        </div>
        <media-lightbox .open=${this.isLightboxOpen} .src=${imageSrc} .alt=${slide.title || ''} .onClose=${() => (this.isLightboxOpen = false)}></media-lightbox>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'slide-image-template': SlideImageTemplate;
  }
}

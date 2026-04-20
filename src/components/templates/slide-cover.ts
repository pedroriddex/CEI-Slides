import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {ContentPhase, Direction, SlideDocument, SlideTemplateProps} from '../../lib/types';
import {resolveSelectivePhase} from '../../lib/slide-transition';
import '../blocks/motion-auto-size';

@customElement('slide-cover-template')
export class SlideCoverTemplate extends LitElement implements SlideTemplateProps {
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
    const numberPhase = resolveSelectivePhase(
      this.bodyPhase,
      {theme: slide.theme ?? null, showThemeNumber: slide.showThemeNumber !== false},
      {theme: comparison?.theme ?? null, showThemeNumber: comparison?.showThemeNumber !== false}
    );
    const iconPhase = resolveSelectivePhase(this.bodyPhase, slide.icon || '', comparison?.icon || '');
    const titlePhase = resolveSelectivePhase(this.bodyPhase, slide.title || '', comparison?.title || '');
    const descriptionPhase = resolveSelectivePhase(this.bodyPhase, slide.description || '', comparison?.description || '');

    return html`
      <div class="slide-cover">
        ${slide.showThemeNumber !== false && slide.theme ? html`<span class="slide-cover__number slide-motion-shell slide-motion-shell--${numberPhase} slide-motion-shell--${this.direction}">${slide.theme}</span>` : nothing}
        <motion-auto-size
          outer-class="slide-cover__copy"
          inner-class="slide-cover__copy-inner"
          .active=${this.motionActive}
          .content=${html`
            ${(slide.icon || slide.title)
              ? html`
                  <div class="slide-cover__heading" data-flow-key="heading">
                    ${slide.icon ? html`<div class="slide-motion-shell slide-motion-shell--${iconPhase} slide-motion-shell--${this.direction}"><i class="${slide.icon} slide-heading__icon slide-heading__icon--lg"></i></div>` : nothing}
                    ${slide.title ? html`<div class="slide-motion-shell slide-motion-shell--${titlePhase} slide-motion-shell--${this.direction}"><h1 class="slide-cover__title">${slide.title}</h1></div>` : nothing}
                  </div>
                `
              : nothing}
            ${slide.description
              ? html`
                  <div data-flow-key="description">
                    <p class="slide-body slide-motion-shell slide-motion-shell--${descriptionPhase} slide-motion-shell--${this.direction}">${slide.description}</p>
                  </div>
                `
              : nothing}
          `}
        ></motion-auto-size>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'slide-cover-template': SlideCoverTemplate;
  }
}

import {LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {html, unsafeStatic} from 'lit/static-html.js';
import type {ContentPhase, Direction, SlideDocument, SlideTemplate, SlideTemplateProps} from '../../lib/types';
import './slide-cover';
import './slide-about';
import './slide-text';
import './slide-card';
import './slide-image';

const TAG_BY_TEMPLATE: Record<SlideTemplate, string> = {
  cover: 'slide-cover-template',
  about: 'slide-about-template',
  image: 'slide-image-template',
  card: 'slide-card-template',
  text: 'slide-text-template'
};

const FALLBACK_TAG = TAG_BY_TEMPLATE.text;

@customElement('slide-renderer')
export class SlideRenderer extends LitElement implements SlideTemplateProps {
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
    const tag = unsafeStatic(TAG_BY_TEMPLATE[this.slide.template] ?? FALLBACK_TAG);

    return html`
      <${tag}
        .slide=${this.slide}
        .slug=${this.slug}
        .comparisonSlide=${this.comparisonSlide}
        .bodyPhase=${this.bodyPhase}
        .motionActive=${this.motionActive}
        .direction=${this.direction}
      ></${tag}>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'slide-renderer': SlideRenderer;
  }
}

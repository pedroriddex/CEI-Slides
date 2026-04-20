import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {ContentPhase, Direction, SlideDocument, SlideTemplateProps} from '../../lib/types';
import './slide-cover';
import './slide-about';
import './slide-text';
import './slide-card';
import './slide-image';

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

  private commonProps() {
    return {
      slide: this.slide,
      slug: this.slug,
      comparisonSlide: this.comparisonSlide,
      bodyPhase: this.bodyPhase,
      motionActive: this.motionActive,
      direction: this.direction
    };
  }

  render() {
    const props = this.commonProps();

    switch (this.slide.template) {
      case 'cover':
        return html`<slide-cover-template .slide=${props.slide} .slug=${props.slug} .comparisonSlide=${props.comparisonSlide} .bodyPhase=${props.bodyPhase} .motionActive=${props.motionActive} .direction=${props.direction}></slide-cover-template>`;
      case 'about':
        return html`<slide-about-template .slide=${props.slide} .slug=${props.slug} .comparisonSlide=${props.comparisonSlide} .bodyPhase=${props.bodyPhase} .motionActive=${props.motionActive} .direction=${props.direction}></slide-about-template>`;
      case 'image':
        return html`<slide-image-template .slide=${props.slide} .slug=${props.slug} .comparisonSlide=${props.comparisonSlide} .bodyPhase=${props.bodyPhase} .motionActive=${props.motionActive} .direction=${props.direction}></slide-image-template>`;
      case 'card':
        return html`<slide-card-template .slide=${props.slide} .slug=${props.slug} .comparisonSlide=${props.comparisonSlide} .bodyPhase=${props.bodyPhase} .motionActive=${props.motionActive} .direction=${props.direction}></slide-card-template>`;
      case 'text':
      default:
        return html`<slide-text-template .slide=${props.slide} .slug=${props.slug} .comparisonSlide=${props.comparisonSlide} .bodyPhase=${props.bodyPhase} .motionActive=${props.motionActive} .direction=${props.direction}></slide-text-template>`;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'slide-renderer': SlideRenderer;
  }
}

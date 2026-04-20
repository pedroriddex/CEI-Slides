import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {ContentPhase, Direction} from '../../lib/types';

@customElement('slide-heading-block')
export class SlideHeadingBlock extends LitElement {
  @property({attribute: 'heading-title', type: String}) headingTitle = '';
  @property({type: String}) icon: string | null = null;
  @property({type: String}) kind: 'panel' | 'section' = 'section';
  @property({type: String}) titlePhase: ContentPhase = 'idle';
  @property({type: String}) iconPhase: ContentPhase = 'idle';
  @property({type: String}) direction: Direction = 'forward';

  protected createRenderRoot() {
    return this;
  }

  render() {
    if (!this.headingTitle && !this.icon) return nothing;

    return html`
      <div class="slide-heading">
        ${this.icon
          ? html`<div class="slide-motion-shell slide-motion-shell--${this.iconPhase} slide-motion-shell--${this.direction}"><i class="${this.icon} slide-heading__icon ${this.kind === 'panel' ? 'slide-heading__icon--md' : 'slide-heading__icon--section'}"></i></div>`
          : nothing}
        ${this.headingTitle
          ? this.kind === 'panel'
            ? html`<div class="slide-motion-shell slide-motion-shell--${this.titlePhase} slide-motion-shell--${this.direction}"><h3 class="slide-panel__title">${this.headingTitle}</h3></div>`
            : html`<div class="slide-motion-shell slide-motion-shell--${this.titlePhase} slide-motion-shell--${this.direction}"><h2 class="slide-section__title">${this.headingTitle}</h2></div>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'slide-heading-block': SlideHeadingBlock;
  }
}

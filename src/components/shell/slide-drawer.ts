import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {SlideDocument, SlideTemplate} from '../../lib/types';
import '../blocks/index-link-row';

const TEMPLATE_ICONS: Record<SlideTemplate, string> = {
  cover: 'ri-layout-top-line',
  about: 'ri-user-smile-line',
  card: 'ri-layout-grid-line',
  image: 'ri-image-line',
  text: 'ri-text'
};

@customElement('slide-drawer-shell')
export class SlideDrawerShell extends LitElement {
  @property({attribute: false}) slides: SlideDocument[] = [];
  @property({type: Number}) activeIndex = 0;
  @property({type: Boolean}) open = false;
  @property({attribute: 'drawer-title', type: String}) drawerTitle = 'Deck';
  @property({type: String}) meta: string | null = null;
  @property({attribute: false}) onClose: () => void = () => undefined;
  @property({attribute: false}) onSelectSlide: (index: number) => void = () => undefined;

  protected createRenderRoot() {
    return this;
  }

  private templateIcon(template: SlideTemplate) {
    return TEMPLATE_ICONS[template] || 'ri-article-line';
  }

  render() {
    return html`
      <div class="slide-drawer ${this.open ? 'slide-drawer--open' : ''}" aria-hidden=${String(!this.open)}>
        <button class="slide-drawer__backdrop" @click=${this.onClose} aria-label="Cerrar listado de slides"></button>
        <aside class="slide-drawer__panel">
          <div class="slide-drawer__header">
            <div>
              <p class="slide-drawer__eyebrow">Slides</p>
              <h2 class="slide-drawer__title">${this.drawerTitle}</h2>
            </div>
            <button class="footer__button" @click=${this.onClose} aria-label="Cerrar panel">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <div class="slide-drawer__list">
            ${this.slides.map(
              (slide, index) => html`
                <index-link-row
                  label=${slide.title || `Slide ${index + 1}`}
                  leadingText=${String(index + 1).padStart(2, '0')}
                  trailingIcon=${this.templateIcon(slide.template)}
                  variant="secondary"
                  ?active=${index === this.activeIndex}
                  .onActivate=${() => this.onSelectSlide(index)}
                ></index-link-row>
              `
            )}
          </div>
        </aside>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'slide-drawer-shell': SlideDrawerShell;
  }
}

import {LitElement, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

@customElement('slide-toolbar-shell')
export class SlideToolbarShell extends LitElement {
  @property({type: Boolean}) isFullscreen = false;
  @property({type: Boolean}) isSlideMenuOpen = false;
  @property({type: Boolean}) canGoPrev = false;
  @property({type: Boolean}) canGoNext = false;
  @property({type: Number}) currentSlideNumber = 1;
  @property({type: Number}) totalSlides = 1;
  @property({type: String}) counterDirection: 'forward' | 'backward' = 'forward';
  @property({attribute: false}) onToggleFullscreen: () => void = () => undefined;
  @property({attribute: false}) onNavigateIndex: () => void = () => undefined;
  @property({attribute: false}) onPrev: () => void = () => undefined;
  @property({attribute: false}) onNext: () => void = () => undefined;
  @property({attribute: false}) onToggleSlideMenu: () => void = () => undefined;
  @state() private previousSlideNumber: number | null = null;
  @state() private counterPhase: 'idle' | 'animating' = 'idle';
  private counterTimeout: number | null = null;

  protected createRenderRoot() {
    return this;
  }

  disconnectedCallback(): void {
    if (this.counterTimeout !== null) {
      window.clearTimeout(this.counterTimeout);
      this.counterTimeout = null;
    }
    super.disconnectedCallback();
  }

  protected updated(changed: Map<string, unknown>) {
    if (changed.has('currentSlideNumber')) {
      const previous = changed.get('currentSlideNumber');
      if (typeof previous === 'number' && previous !== this.currentSlideNumber) {
        if (this.counterTimeout !== null) {
          window.clearTimeout(this.counterTimeout);
          this.counterTimeout = null;
        }
        this.previousSlideNumber = previous;
        this.counterPhase = 'animating';
        this.counterTimeout = window.setTimeout(() => {
          this.previousSlideNumber = null;
          this.counterPhase = 'idle';
          this.counterTimeout = null;
        }, 320);
      }
    }
  }

  private renderCounter() {
    const animated = this.counterPhase === 'animating' && this.previousSlideNumber !== null;

    return html`
      <div class="slide-counter" aria-live="polite" aria-atomic="true">
        <span class="slide-counter__value">
          ${animated
            ? html`
                <span class="slide-counter__number slide-counter__number--out slide-counter__number--${this.counterDirection}">${this.previousSlideNumber}</span>
                <span class="slide-counter__number slide-counter__number--in slide-counter__number--${this.counterDirection}">${this.currentSlideNumber}</span>
              `
            : html`<span class="slide-counter__number slide-counter__number--static">${this.currentSlideNumber}</span>`}
        </span>
        <span class="slide-counter__divider">/</span>
        <span class="slide-counter__total">${this.totalSlides}</span>
      </div>
    `;
  }

  render() {
    return html`
      <div class="slide-frame__toolbar" aria-label="Slide controls">
        <div class="slide-frame__nav slide-frame__nav--left">
          <button class="footer__button ${this.isFullscreen ? 'footer__button--active' : ''}" aria-pressed=${String(this.isFullscreen)} @click=${this.onToggleFullscreen}>
            <i class=${this.isFullscreen ? 'ri-fullscreen-exit-line' : 'ri-fullscreen-line'} title="Pantalla completa" aria-label="Pantalla completa"></i>
            <span class="sr-only">Pantalla completa</span>
          </button>
        </div>

        ${this.totalSlides > 1
          ? html`<div class="slide-frame__counter-float">${this.renderCounter()}</div>`
          : nothing}

        <nav class="slide-frame__nav slide-frame__nav--main" aria-label="Slide navigation">
          <button class="footer__button" ?disabled=${!this.canGoPrev} @click=${this.onPrev}>
            <i class="ri-arrow-left-line" title="Anterior" aria-label="Anterior"></i>
            <span class="sr-only">Anterior</span>
          </button>

          <button class="footer__button" @click=${this.onNavigateIndex}>
            <i class="ri-home-5-fill" title="Ir al índice" aria-label="Ir al índice"></i>
            <span class="sr-only">Índice</span>
          </button>

          <button class="footer__button" ?disabled=${!this.canGoNext} @click=${this.onNext}>
            <i class="ri-arrow-right-line" title="Siguiente" aria-label="Siguiente"></i>
            <span class="sr-only">Siguiente</span>
          </button>
        </nav>

        <div class="slide-frame__nav slide-frame__nav--right">
          <button class="footer__button ${this.isSlideMenuOpen ? 'footer__button--active' : ''}" aria-pressed=${String(this.isSlideMenuOpen)} @click=${this.onToggleSlideMenu}>
            <i class="ri-menu-2-line" title="Abrir listado de slides" aria-label="Abrir listado de slides"></i>
            <span class="sr-only">Slides</span>
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'slide-toolbar-shell': SlideToolbarShell;
  }
}

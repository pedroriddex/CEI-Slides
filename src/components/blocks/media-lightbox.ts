import {LitElement, html, nothing, render as renderTemplate} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

@customElement('media-lightbox')
export class MediaLightbox extends LitElement {
  @property({type: Boolean}) open = false;
  @property({type: String}) src = '';
  @property({type: String}) alt = '';
  @property({attribute: false}) onClose: () => void = () => undefined;
  @state() private portalPhase: 'closed' | 'opening' | 'open' | 'closing' = 'closed';
  private portalHost: HTMLDivElement | null = null;
  private phaseTimeout: number | null = null;

  protected createRenderRoot() {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.portalHost = document.createElement('div');
    this.portalHost.className = 'media-lightbox-root';
    document.body.appendChild(this.portalHost);
    window.addEventListener('keydown', this.handleKeydown);
    this.syncPortalPhase();
  }

  disconnectedCallback(): void {
    window.removeEventListener('keydown', this.handleKeydown);
    this.clearPhaseTimeout();
    if (this.portalHost) {
      renderTemplate(nothing, this.portalHost);
      this.portalHost.remove();
      this.portalHost = null;
    }
    super.disconnectedCallback();
  }

  protected updated(changed: Map<string, unknown>): void {
    if (changed.has('open') || changed.has('src')) {
      this.syncPortalPhase();
      return;
    }

    this.renderPortal();
  }

  private clearPhaseTimeout() {
    if (this.phaseTimeout !== null) {
      window.clearTimeout(this.phaseTimeout);
      this.phaseTimeout = null;
    }
  }

  private syncPortalPhase() {
    this.clearPhaseTimeout();

    if (this.open && this.src) {
      this.portalPhase = 'opening';
      this.renderPortal();
      requestAnimationFrame(() => {
        this.portalPhase = 'open';
        this.renderPortal();
      });
      return;
    }

    if (this.portalPhase === 'open' || this.portalPhase === 'opening') {
      this.portalPhase = 'closing';
      this.renderPortal();
      this.phaseTimeout = window.setTimeout(() => {
        this.portalPhase = 'closed';
        this.renderPortal();
        this.phaseTimeout = null;
      }, 240);
      return;
    }

    this.portalPhase = 'closed';
    this.renderPortal();
  }

  private readonly handleKeydown = (event: KeyboardEvent) => {
    if ((this.portalPhase === 'open' || this.portalPhase === 'opening') && event.key === 'Escape') {
      this.onClose();
    }
  };

  private readonly stopPropagation = (event: Event) => {
    event.stopPropagation();
  };

  private renderPortal() {
    if (!this.portalHost) return;

    const visible = this.portalPhase !== 'closed' && Boolean(this.src);
    const template = !visible
      ? nothing
      : html`
          <div class="media-lightbox media-lightbox--${this.portalPhase}" @click=${this.onClose}>
            <div class="media-lightbox__dialog" @click=${this.stopPropagation}>
              <button class="media-lightbox__close" type="button" @click=${this.onClose} aria-label="Cerrar imagen ampliada">
                <i class="ri-close-line"></i>
              </button>
              <img class="media-lightbox__image" src=${this.src} alt=${this.alt} />
            </div>
          </div>
        `;

    renderTemplate(template, this.portalHost);
  }

  render() {
    return nothing;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'media-lightbox': MediaLightbox;
  }
}

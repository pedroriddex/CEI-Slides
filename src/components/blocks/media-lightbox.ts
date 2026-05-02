import {LitElement, html, nothing, render as renderTemplate} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {strings} from '../../lib/i18n';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

@customElement('media-lightbox')
export class MediaLightbox extends LitElement {
  @property({type: Boolean}) open = false;
  @property({type: String}) src = '';
  @property({type: String}) alt = '';
  @property({attribute: false}) onClose: () => void = () => undefined;
  @state() private portalPhase: 'closed' | 'opening' | 'open' | 'closing' = 'closed';
  private portalHost: HTMLDivElement | null = null;
  private phaseTimeout: number | null = null;
  private previouslyFocused: HTMLElement | null = null;

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
    this.restoreFocus();
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

  private captureFocus() {
    if (this.previouslyFocused) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      this.previouslyFocused = active;
    }
  }

  private restoreFocus() {
    const target = this.previouslyFocused;
    this.previouslyFocused = null;
    if (!target) return;
    if (typeof target.focus === 'function') {
      // requestAnimationFrame ensures the element exists in the layout
      // (relevant when the trigger is in a motion shell that may be
      // transiently hidden during a slide transition).
      requestAnimationFrame(() => target.focus());
    }
  }

  private focusInitialElement() {
    const root = this.portalHost?.querySelector<HTMLElement>('.media-lightbox__dialog');
    const first = root?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? null;
    first?.focus();
  }

  private syncPortalPhase() {
    this.clearPhaseTimeout();

    if (this.open && this.src) {
      this.captureFocus();
      this.portalPhase = 'opening';
      this.renderPortal();
      requestAnimationFrame(() => {
        this.portalPhase = 'open';
        this.renderPortal();
        this.focusInitialElement();
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
        this.restoreFocus();
      }, 240);
      return;
    }

    this.portalPhase = 'closed';
    this.renderPortal();
  }

  private readonly handleKeydown = (event: KeyboardEvent) => {
    const isOpen = this.portalPhase === 'open' || this.portalPhase === 'opening';
    if (!isOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.onClose();
      return;
    }

    if (event.key === 'Tab') {
      this.trapTab(event);
    }
  };

  private trapTab(event: KeyboardEvent) {
    const dialog = this.portalHost?.querySelector<HTMLElement>('.media-lightbox__dialog');
    if (!dialog) return;

    const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (node) => !node.hasAttribute('inert') && node.tabIndex !== -1
    );
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (active === first || !active || !dialog.contains(active)) {
        event.preventDefault();
        last.focus();
      }
      return;
    }

    if (active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private readonly stopPropagation = (event: Event) => {
    event.stopPropagation();
  };

  private renderPortal() {
    if (!this.portalHost) return;

    const visible = this.portalPhase !== 'closed' && Boolean(this.src);
    const template = !visible
      ? nothing
      : html`
          <div
            class="media-lightbox media-lightbox--${this.portalPhase}"
            role="dialog"
            aria-modal="true"
            aria-label=${this.alt || strings.lightbox.close}
            @click=${this.onClose}
          >
            <div class="media-lightbox__dialog" @click=${this.stopPropagation}>
              <button type="button" class="media-lightbox__close" @click=${this.onClose} aria-label=${strings.lightbox.close}>
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

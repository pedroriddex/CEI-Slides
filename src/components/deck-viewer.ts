import {LitElement, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {DeckDocument} from '../lib/types';
import {colorValue} from '../lib/theme';
import {FullscreenController} from '../lib/controllers/fullscreen-controller';
import {KeyboardController} from '../lib/controllers/keyboard-controller';
import {SlideTransitionController} from '../lib/controllers/slide-transition-controller';
import {strings} from '../lib/i18n';
import './shell/slide-frame';
import './shell/slide-toolbar';
import './shell/slide-drawer';

/**
 * Thin orchestrator around three ReactiveControllers:
 *
 *   - `SlideTransitionController` owns the transition state machine
 *     (renderedSlideIndex, phases, motionActive, direction, isNavigating).
 *   - `FullscreenController` owns the document fullscreen state.
 *   - `KeyboardController` wires window keyboard to prev/next/escape.
 *
 * The component itself just forwards props to its shells and hosts the
 * drawer open/close toggle, which is UI-local and not part of the
 * transition machine.
 */
@customElement('deck-viewer')
export class DeckViewer extends LitElement {
  @property({attribute: false}) document!: DeckDocument;
  @property({attribute: false}) onNavigateIndex: () => void = () => undefined;
  @property({attribute: false}) onSlideChange: (slide: number) => void = () => undefined;
  @property({type: Number}) slideIndex = 0;
  @property({type: String}) versionId = '';

  @state() private isSlideMenuOpen = false;

  private readonly transitions = new SlideTransitionController(this, {
    getDocument: () => this.document,
    onSlideChange: (index) => this.onSlideChange(index)
  });

  private readonly fullscreen = new FullscreenController(this);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private readonly keyboard = new KeyboardController(this, {
    onPrev: () => void this.transitions.goToSlide(this.slideIndex - 1),
    onNext: () => void this.transitions.goToSlide(this.slideIndex + 1),
    onEscape: () => {
      if (this.isSlideMenuOpen) this.isSlideMenuOpen = false;
    },
    isBlocked: () => this.transitions.state.isNavigating
  });

  protected createRenderRoot() {
    return this;
  }

  protected updated(changed: Map<string, unknown>) {
    if (changed.has('document')) {
      this.transitions.reset();
      this.transitions.syncToIndex(this.slideIndex);
      return;
    }

    if (changed.has('slideIndex') && !this.transitions.state.isNavigating) {
      this.transitions.syncToIndex(this.slideIndex);
    }
  }

  private currentSlug() {
    return String(this.document.slides[0]?.slug || '').trim();
  }

  private readonly toggleSlideMenu = () => {
    this.isSlideMenuOpen = !this.isSlideMenuOpen;
  };

  render() {
    const slides = this.document.slides;
    const state = this.transitions.state;
    const current = this.transitions.currentSlide();
    const slug = this.currentSlug();
    const first = slides[0];
    const accent = colorValue((first.color as any) || 'black');

    const toolbar = html`
      <slide-toolbar-shell
        .isFullscreen=${this.fullscreen.isFullscreen}
        .isSlideMenuOpen=${this.isSlideMenuOpen}
        .canGoPrev=${state.renderedSlideIndex > 0}
        .canGoNext=${state.renderedSlideIndex < slides.length - 1}
        .currentSlideNumber=${state.renderedSlideIndex + 1}
        .totalSlides=${slides.length}
        .counterDirection=${state.direction}
        .onToggleFullscreen=${this.fullscreen.toggle}
        .onNavigateIndex=${this.onNavigateIndex}
        .onPrev=${() => void this.transitions.goToSlide(state.renderedSlideIndex - 1)}
        .onNext=${() => void this.transitions.goToSlide(state.renderedSlideIndex + 1)}
        .onToggleSlideMenu=${this.toggleSlideMenu}
      ></slide-toolbar-shell>
    `;

    return html`
      <slide-drawer-shell
        .slides=${slides}
        .activeIndex=${state.renderedSlideIndex}
        .open=${this.isSlideMenuOpen}
        .drawerTitle=${first.title || strings.slides.deckFallbackTitle}
        .meta=${this.versionId || null}
        .onClose=${() => (this.isSlideMenuOpen = false)}
        .onSelectSlide=${(index: number) => void this.transitions.goToSlide(index)}
      ></slide-drawer-shell>

      <slide-frame-shell
        .slide=${current}
        .previousSlide=${state.previousSlide}
        .comparisonSlide=${state.comparisonSlide}
        .bodyPhase=${state.bodyPhase}
        .motionActive=${state.motionActive}
        .slug=${slug}
        .accentColor=${accent}
        .toolbar=${toolbar}
        .transitionKind=${state.transitionKind}
        .transitionPhase=${state.transitionPhase}
        .direction=${state.direction}
      ></slide-frame-shell>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-viewer': DeckViewer;
  }
}

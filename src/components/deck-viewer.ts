import {LitElement, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {ContentPhase, DeckDocument, Direction, SlideDocument, SlideTransitionMode} from '../lib/types';
import {resolveSlideTransitionMode} from '../lib/slide-transition';
import {colorValue} from '../lib/theme';
import {SELECTIVE_RESIZE_END_EVENT, SELECTIVE_RESIZE_START_EVENT} from '../lib/selective-resize-controller';
import './shell/slide-frame';
import './shell/slide-toolbar';
import './shell/slide-drawer';

const WHOLE_SLIDE_OUT_MS = 220;
const WHOLE_SLIDE_LAYOUT_MS = 280;
const WHOLE_SLIDE_ENTER_MS = 260;
const BODY_OUT_MS = 80;
const BODY_SETTLE_MS = 0;
const SELECTIVE_RESIZE_OBSERVE_MS = 96;
const SELECTIVE_RESIZE_GUARD_MS = 900;

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

@customElement('deck-viewer')
export class DeckViewer extends LitElement {
  @property({attribute: false}) document!: DeckDocument;
  @property({attribute: false}) onNavigateIndex: () => void = () => undefined;
  @property({attribute: false}) onSlideChange: (slide: number) => void = () => undefined;
  @property({type: Number}) slideIndex = 0;
  @property({type: String}) versionId = '';
  @state() private isFullscreen = false;
  @state() private isSlideMenuOpen = false;
  @state() private renderedSlideIndex = 0;
  @state() private previousSlide: SlideDocument | null = null;
  @state() private bodyComparisonSlide: SlideDocument | null = null;
  @state() private slideMotionDirection: Direction = 'forward';
  @state() private slideTransitionKind: 'idle' | SlideTransitionMode = 'idle';
  @state() private slideTransitionPhase: 'idle' | 'exit' | 'layout' | 'enter' = 'idle';
  @state() private bodyPhase: ContentPhase = 'idle';
  @state() private motionActive = false;
  @state() private isNavigating = false;
  private slideMotionTimeouts: number[] = [];

  protected createRenderRoot() {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    window.addEventListener('keydown', this.handleKeydown);
  }

  disconnectedCallback(): void {
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    window.removeEventListener('keydown', this.handleKeydown);
    this.clearSlideMotionTimers();
    super.disconnectedCallback();
  }

  protected updated(changed: Map<string, unknown>) {
    if (changed.has('document')) {
      this.resetAllMotion();
      this.renderedSlideIndex = Math.max(0, Math.min(this.slideIndex, this.document.slides.length - 1));
      return;
    }

    if (changed.has('slideIndex') && !this.isNavigating) {
      this.renderedSlideIndex = Math.max(0, Math.min(this.slideIndex, this.document.slides.length - 1));
    }
  }

  private readonly handleFullscreenChange = () => {
    this.isFullscreen = Boolean(document.fullscreenElement);
  };

  private readonly handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.isSlideMenuOpen) {
      this.isSlideMenuOpen = false;
      return;
    }

    if (this.isNavigating) return;

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      void this.goToSlide(this.slideIndex - 1);
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      void this.goToSlide(this.slideIndex + 1);
    }
  };

  private currentSlide(): SlideDocument {
    const slides = this.document.slides;
    const safeIndex = Math.max(0, Math.min(this.renderedSlideIndex, slides.length - 1));
    return slides[safeIndex];
  }

  private currentSlug() {
    return String(this.document.slides[0]?.slug || '').trim();
  }

  private clearSlideMotionTimers() {
    for (const timeout of this.slideMotionTimeouts) {
      window.clearTimeout(timeout);
    }
    this.slideMotionTimeouts = [];
  }

  private resetAllMotion() {
    this.clearSlideMotionTimers();
    this.previousSlide = null;
    this.bodyComparisonSlide = null;
    this.slideTransitionKind = 'idle';
    this.slideTransitionPhase = 'idle';
    this.bodyPhase = 'idle';
    this.motionActive = false;
    this.isNavigating = false;
  }

  private async animateWholeFrame(nextIndex: number, previousSlide: SlideDocument) {
    this.previousSlide = previousSlide;
    this.bodyComparisonSlide = null;
    this.bodyPhase = 'idle';
    this.motionActive = false;
    this.slideTransitionKind = 'whole-layout';
    this.slideTransitionPhase = 'exit';
    await wait(WHOLE_SLIDE_OUT_MS);
    this.renderedSlideIndex = nextIndex;
    this.onSlideChange(nextIndex);
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    this.slideTransitionPhase = 'layout';
    await wait(WHOLE_SLIDE_LAYOUT_MS);
    this.slideTransitionPhase = 'enter';
    await wait(WHOLE_SLIDE_ENTER_MS);
    this.previousSlide = null;
    this.slideTransitionKind = 'idle';
    this.slideTransitionPhase = 'idle';
  }

  private async animateWholeSameLayout(nextIndex: number, previousSlide: SlideDocument) {
    this.previousSlide = previousSlide;
    this.bodyComparisonSlide = null;
    this.bodyPhase = 'idle';
    this.motionActive = false;
    this.slideTransitionKind = 'whole-same-layout';
    this.slideTransitionPhase = 'exit';
    await wait(WHOLE_SLIDE_OUT_MS);
    this.renderedSlideIndex = nextIndex;
    this.onSlideChange(nextIndex);
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    this.slideTransitionPhase = 'enter';
    await wait(WHOLE_SLIDE_ENTER_MS);
    this.previousSlide = null;
    this.slideTransitionKind = 'idle';
    this.slideTransitionPhase = 'idle';
  }

  private async animateSelectiveBody(nextIndex: number, currentSlide: SlideDocument, nextSlide: SlideDocument) {
    this.previousSlide = null;
    this.slideTransitionPhase = 'idle';
    this.motionActive = true;
    this.bodyComparisonSlide = nextSlide;
    this.bodyPhase = 'out';
    await wait(BODY_OUT_MS);
    this.bodyComparisonSlide = currentSlide;
    const resizePromise = this.waitForSelectiveResize();
    this.renderedSlideIndex = nextIndex;
    this.onSlideChange(nextIndex);
    this.bodyPhase = 'in';
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    this.bodyPhase = 'idle';
    await resizePromise;
    await wait(BODY_SETTLE_MS);
    this.motionActive = false;
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    this.bodyComparisonSlide = null;
  }

  private waitForSelectiveResize() {
    return new Promise<void>((resolve) => {
      let started = 0;
      let pending = 0;
      let finished = false;
      let sawResize = false;

      const cleanup = () => {
        if (finished) return;
        finished = true;
        this.removeEventListener(SELECTIVE_RESIZE_START_EVENT, onStart as EventListener);
        this.removeEventListener(SELECTIVE_RESIZE_END_EVENT, onEnd as EventListener);
        window.clearTimeout(observeTimeout);
        window.clearTimeout(guardTimeout);
      };

      const resolveDone = (reason: 'no-start' | 'all-ended' | 'guard-timeout') => {
        if (import.meta.env.DEV) {
          console.debug('[selective-resize-gate]', {
            reason,
            started,
            pending,
            sawResize
          });
        }
        cleanup();
        resolve();
      };

      const maybeResolve = () => {
        if (sawResize && pending === 0) {
          requestAnimationFrame(() => resolveDone('all-ended'));
        }
      };

      const onStart = () => {
        started += 1;
        pending += 1;
        sawResize = true;
      };

      const onEnd = () => {
        pending = Math.max(0, pending - 1);
        maybeResolve();
      };

      const observeTimeout = window.setTimeout(() => {
        if (!sawResize) {
          resolveDone('no-start');
        }
      }, SELECTIVE_RESIZE_OBSERVE_MS);

      const guardTimeout = window.setTimeout(() => resolveDone('guard-timeout'), SELECTIVE_RESIZE_GUARD_MS);

      this.addEventListener(SELECTIVE_RESIZE_START_EVENT, onStart as EventListener);
      this.addEventListener(SELECTIVE_RESIZE_END_EVENT, onEnd as EventListener);
    });
  }

  private async goToSlide(index: number) {
    const next = Math.max(0, Math.min(index, this.document.slides.length - 1));
    if (next === this.renderedSlideIndex || this.isNavigating) return;

    const currentSlide = this.currentSlide();
    const nextSlide = this.document.slides[next];
    const decision = resolveSlideTransitionMode(currentSlide, nextSlide);
    this.slideMotionDirection = next > this.renderedSlideIndex ? 'forward' : 'backward';
    this.isNavigating = true;
    this.isSlideMenuOpen = false;

    if (import.meta.env.DEV) {
      console.debug('[slide-transition]', {
        from: this.slideIndex,
        renderedFrom: this.renderedSlideIndex,
        to: next,
        mode: decision.mode,
        sharedGroups: decision.sharedGroups,
        fromTitle: currentSlide.title || null,
        toTitle: nextSlide.title || null
      });
    }

    try {
      if (decision.mode === 'selective') {
        await this.animateSelectiveBody(next, currentSlide, nextSlide);
      } else if (decision.mode === 'whole-same-layout') {
        await this.animateWholeSameLayout(next, currentSlide);
      } else {
        await this.animateWholeFrame(next, currentSlide);
      }
    } finally {
      this.isNavigating = false;
    }
  }

  private readonly toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  };

  private readonly toggleSlideMenu = () => {
    this.isSlideMenuOpen = !this.isSlideMenuOpen;
  };

  render() {
    const slides = this.document.slides;
    const current = this.currentSlide();
    const slug = this.currentSlug();
    const first = slides[0];
    const accent = colorValue((first.color as any) || 'black');
    const toolbar = html`
      <slide-toolbar-shell
        .isFullscreen=${this.isFullscreen}
        .isSlideMenuOpen=${this.isSlideMenuOpen}
        .canGoPrev=${this.renderedSlideIndex > 0}
        .canGoNext=${this.renderedSlideIndex < slides.length - 1}
        .currentSlideNumber=${this.renderedSlideIndex + 1}
        .totalSlides=${slides.length}
        .counterDirection=${this.slideMotionDirection}
        .onToggleFullscreen=${this.toggleFullscreen}
        .onNavigateIndex=${this.onNavigateIndex}
        .onPrev=${() => void this.goToSlide(this.renderedSlideIndex - 1)}
        .onNext=${() => void this.goToSlide(this.renderedSlideIndex + 1)}
        .onToggleSlideMenu=${this.toggleSlideMenu}
      ></slide-toolbar-shell>
    `;

    return html`
      <slide-drawer-shell
        .slides=${slides}
        .activeIndex=${this.renderedSlideIndex}
        .open=${this.isSlideMenuOpen}
        .drawerTitle=${first.title || 'Deck'}
        .meta=${this.versionId || null}
        .onClose=${() => (this.isSlideMenuOpen = false)}
        .onSelectSlide=${(index: number) => void this.goToSlide(index)}
      ></slide-drawer-shell>

      <slide-frame-shell
        .slide=${current}
        .previousSlide=${this.previousSlide}
        .comparisonSlide=${this.bodyComparisonSlide}
        .bodyPhase=${this.bodyPhase}
        .motionActive=${this.motionActive}
        .slug=${slug}
        .accentColor=${accent}
        .toolbar=${toolbar}
        .transitionKind=${this.slideTransitionKind}
        .transitionPhase=${this.slideTransitionPhase}
        .direction=${this.slideMotionDirection}
      ></slide-frame-shell>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deck-viewer': DeckViewer;
  }
}

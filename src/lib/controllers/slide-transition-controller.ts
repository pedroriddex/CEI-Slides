import type {ReactiveController, ReactiveControllerHost} from 'lit';
import type {ContentPhase, DeckDocument, Direction, SlideDocument, SlideTransitionMode} from '../types';
import {resolveSlideTransitionMode} from '../slide-transition';
import {SELECTIVE_RESIZE_END_EVENT, SELECTIVE_RESIZE_START_EVENT} from '../selective-resize-controller';
import {FLOW_RESIZE_GUARD_MS} from '../flow-motion';
import {devDebug} from '../dev-log';

const WHOLE_SLIDE_OUT_MS = 220;
const WHOLE_SLIDE_LAYOUT_MS = 280;
const WHOLE_SLIDE_ENTER_MS = 260;
const BODY_OUT_MS = 80;
const BODY_SETTLE_MS = 0;
const SELECTIVE_RESIZE_OBSERVE_MS = 96;
const SELECTIVE_RESIZE_GUARD_MS = FLOW_RESIZE_GUARD_MS;

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(() => resolve(), ms));
}

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

type TransitionKind = 'idle' | SlideTransitionMode;
type TransitionPhase = 'idle' | 'exit' | 'layout' | 'enter';

export interface SlideTransitionState {
  renderedSlideIndex: number;
  previousSlide: SlideDocument | null;
  comparisonSlide: SlideDocument | null;
  transitionKind: TransitionKind;
  transitionPhase: TransitionPhase;
  bodyPhase: ContentPhase;
  motionActive: boolean;
  direction: Direction;
  isNavigating: boolean;
}

interface SlideTransitionHost extends ReactiveControllerHost, EventTarget {}

export interface SlideTransitionOptions {
  getDocument: () => DeckDocument;
  onSlideChange: (index: number) => void;
}

/**
 * Owns the slide-viewer transition state machine. The host reads
 * `controller.state` in its `render()` and calls `goToSlide` / `syncToIndex`
 * / `reset` from lifecycle + UI callbacks. Selective-body resize gating
 * listens on the host because the underlying `SelectiveResizeController`
 * dispatches its events from nested shell elements and they bubble up.
 */
export class SlideTransitionController implements ReactiveController {
  state: SlideTransitionState = {
    renderedSlideIndex: 0,
    previousSlide: null,
    comparisonSlide: null,
    transitionKind: 'idle',
    transitionPhase: 'idle',
    bodyPhase: 'idle',
    motionActive: false,
    direction: 'forward',
    isNavigating: false
  };

  private readonly host: SlideTransitionHost;
  private readonly getDocument: () => DeckDocument;
  private readonly onSlideChange: (index: number) => void;

  constructor(host: SlideTransitionHost, options: SlideTransitionOptions) {
    this.host = host;
    this.getDocument = options.getDocument;
    this.onSlideChange = options.onSlideChange;
    host.addController(this);
  }

  hostConnected(): void {}

  hostDisconnected(): void {
    this.reset();
  }

  /** Clamp `index` against the current document and update render state. */
  syncToIndex(index: number): void {
    const slides = this.getDocument().slides;
    const safe = Math.max(0, Math.min(index, slides.length - 1));
    if (safe === this.state.renderedSlideIndex) return;
    this.patch({renderedSlideIndex: safe});
  }

  /** Reset to idle state — used when the deck document changes. */
  reset(): void {
    this.patch({
      previousSlide: null,
      comparisonSlide: null,
      transitionKind: 'idle',
      transitionPhase: 'idle',
      bodyPhase: 'idle',
      motionActive: false,
      isNavigating: false
    });
  }

  currentSlide(): SlideDocument {
    const slides = this.getDocument().slides;
    const safeIndex = Math.max(0, Math.min(this.state.renderedSlideIndex, slides.length - 1));
    return slides[safeIndex];
  }

  async goToSlide(index: number): Promise<void> {
    const document = this.getDocument();
    const next = Math.max(0, Math.min(index, document.slides.length - 1));
    if (next === this.state.renderedSlideIndex || this.state.isNavigating) return;

    const currentSlide = this.currentSlide();
    const nextSlide = document.slides[next];
    const decision = resolveSlideTransitionMode(currentSlide, nextSlide);
    const direction: Direction = next > this.state.renderedSlideIndex ? 'forward' : 'backward';

    this.patch({direction, isNavigating: true});

    devDebug('slide-transition', {
      renderedFrom: this.state.renderedSlideIndex,
      to: next,
      mode: decision.mode,
      sharedGroups: decision.sharedGroups,
      fromTitle: currentSlide.title || null,
      toTitle: nextSlide.title || null
    });

    try {
      if (decision.mode === 'selective') {
        await this.animateSelectiveBody(next, currentSlide, nextSlide);
      } else if (decision.mode === 'whole-same-layout') {
        await this.animateWholeSameLayout(next, currentSlide);
      } else {
        await this.animateWholeFrame(next, currentSlide);
      }
    } finally {
      this.patch({isNavigating: false});
    }
  }

  private async animateWholeFrame(nextIndex: number, previousSlide: SlideDocument) {
    this.patch({
      previousSlide,
      comparisonSlide: null,
      bodyPhase: 'idle',
      motionActive: false,
      transitionKind: 'whole-layout',
      transitionPhase: 'exit'
    });
    await wait(WHOLE_SLIDE_OUT_MS);
    this.patch({renderedSlideIndex: nextIndex});
    this.onSlideChange(nextIndex);
    await nextFrame();
    this.patch({transitionPhase: 'layout'});
    await wait(WHOLE_SLIDE_LAYOUT_MS);
    this.patch({transitionPhase: 'enter'});
    await wait(WHOLE_SLIDE_ENTER_MS);
    this.patch({previousSlide: null, transitionKind: 'idle', transitionPhase: 'idle'});
  }

  private async animateWholeSameLayout(nextIndex: number, previousSlide: SlideDocument) {
    this.patch({
      previousSlide,
      comparisonSlide: null,
      bodyPhase: 'idle',
      motionActive: false,
      transitionKind: 'whole-same-layout',
      transitionPhase: 'exit'
    });
    await wait(WHOLE_SLIDE_OUT_MS);
    this.patch({renderedSlideIndex: nextIndex});
    this.onSlideChange(nextIndex);
    await nextFrame();
    this.patch({transitionPhase: 'enter'});
    await wait(WHOLE_SLIDE_ENTER_MS);
    this.patch({previousSlide: null, transitionKind: 'idle', transitionPhase: 'idle'});
  }

  private async animateSelectiveBody(
    nextIndex: number,
    currentSlide: SlideDocument,
    nextSlide: SlideDocument
  ) {
    this.patch({
      previousSlide: null,
      transitionPhase: 'idle',
      motionActive: true,
      comparisonSlide: nextSlide,
      bodyPhase: 'out'
    });
    await wait(BODY_OUT_MS);
    this.patch({comparisonSlide: currentSlide});
    const resizePromise = this.waitForSelectiveResize();
    this.patch({renderedSlideIndex: nextIndex});
    this.onSlideChange(nextIndex);
    this.patch({bodyPhase: 'in'});
    await nextFrame();
    this.patch({bodyPhase: 'idle'});
    await resizePromise;
    await wait(BODY_SETTLE_MS);
    this.patch({motionActive: false});
    await nextFrame();
    this.patch({comparisonSlide: null});
  }

  private waitForSelectiveResize() {
    return new Promise<void>((resolve) => {
      let started = 0;
      let pending = 0;
      let finished = false;
      let sawResize = false;

      const onStart = () => {
        started += 1;
        pending += 1;
        sawResize = true;
      };

      const onEnd = () => {
        pending = Math.max(0, pending - 1);
        maybeResolve();
      };

      const cleanup = () => {
        if (finished) return;
        finished = true;
        this.host.removeEventListener(SELECTIVE_RESIZE_START_EVENT, onStart as EventListener);
        this.host.removeEventListener(SELECTIVE_RESIZE_END_EVENT, onEnd as EventListener);
        window.clearTimeout(observeTimeout);
        window.clearTimeout(guardTimeout);
      };

      const resolveDone = (reason: 'no-start' | 'all-ended' | 'guard-timeout') => {
        devDebug('selective-resize-gate', {reason, started, pending, sawResize});
        cleanup();
        resolve();
      };

      const maybeResolve = () => {
        if (sawResize && pending === 0) {
          requestAnimationFrame(() => resolveDone('all-ended'));
        }
      };

      const observeTimeout = window.setTimeout(() => {
        if (!sawResize) resolveDone('no-start');
      }, SELECTIVE_RESIZE_OBSERVE_MS);

      const guardTimeout = window.setTimeout(
        () => resolveDone('guard-timeout'),
        SELECTIVE_RESIZE_GUARD_MS
      );

      this.host.addEventListener(SELECTIVE_RESIZE_START_EVENT, onStart as EventListener);
      this.host.addEventListener(SELECTIVE_RESIZE_END_EVENT, onEnd as EventListener);
    });
  }

  private patch(next: Partial<SlideTransitionState>) {
    this.state = {...this.state, ...next};
    this.host.requestUpdate();
  }
}

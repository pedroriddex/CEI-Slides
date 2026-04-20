import type {ReactiveController, ReactiveControllerHost} from 'lit';
import {animateElementHeight, animateFlowChildren, captureFlowSnapshot, type FlowSnapshot} from './flow-motion';

export const SELECTIVE_RESIZE_START_EVENT = 'selective-resize-start';
export const SELECTIVE_RESIZE_END_EVENT = 'selective-resize-end';

export type SelectiveResizeStage = 'idle' | 'resizing';

interface SelectiveResizeHost extends ReactiveControllerHost, EventTarget {
  active: boolean;
  requestUpdate(): void;
}

interface SelectiveResizeControllerOptions {
  getOuter: () => HTMLElement | null;
  getInner: () => HTMLElement | null;
}

function readHeight(element: HTMLElement) {
  return Math.ceil(element.scrollHeight || element.getBoundingClientRect().height);
}

export class SelectiveResizeController implements ReactiveController {
  stage: SelectiveResizeStage = 'idle';

  private readonly host: SelectiveResizeHost;
  private readonly getOuter: () => HTMLElement | null;
  private readonly getInner: () => HTMLElement | null;
  private flowSnapshot: FlowSnapshot | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private observedInner: HTMLElement | null = null;
  private lastKnownHeight = 0;
  private activeResizeToken = 0;

  constructor(host: SelectiveResizeHost, options: SelectiveResizeControllerOptions) {
    this.host = host;
    this.getOuter = options.getOuter;
    this.getInner = options.getInner;
    host.addController(this);
  }

  hostConnected(): void {
    this.resizeObserver = new ResizeObserver(() => {
      if (!this.host.active) return;

      const outer = this.getOuter();
      const inner = this.getInner();
      if (!outer || !inner) return;

      const nextHeight = readHeight(inner);
      const fromHeight = this.lastKnownHeight || nextHeight;
      this.lastKnownHeight = nextHeight;

      if (Math.abs(nextHeight - fromHeight) < 1) return;

      void this.runResize(outer, fromHeight, nextHeight);
    });

    this.syncObservedInner();
  }

  hostDisconnected(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.observedInner = null;
  }

  hostUpdate(): void {
    this.syncObservedInner();

    if (!this.host.active) return;

    const inner = this.getInner();
    if (!inner) return;

    this.flowSnapshot = captureFlowSnapshot(inner);
    this.lastKnownHeight = this.flowSnapshot?.height || this.lastKnownHeight;
  }

  hostUpdated(): void {
    this.syncObservedInner();

    const outer = this.getOuter();
    const inner = this.getInner();
    if (!outer || !inner) return;

    const nextHeight = readHeight(inner);

    if (!this.host.active) {
      outer.style.height = '';
      outer.style.overflow = '';
      outer.style.willChange = '';
      outer.style.transition = '';
      this.lastKnownHeight = nextHeight;
      this.flowSnapshot = null;
      this.setStage('idle');
      return;
    }

    animateFlowChildren(inner, this.flowSnapshot);

    const fromHeight = this.flowSnapshot?.height || this.lastKnownHeight || nextHeight;
    this.lastKnownHeight = nextHeight;
    this.flowSnapshot = null;

    if (Math.abs(nextHeight - fromHeight) < 1) {
      this.setStage('idle');
      return;
    }

    void this.runResize(outer, fromHeight, nextHeight);
  }

  private syncObservedInner() {
    if (!this.resizeObserver) return;

    const inner = this.getInner();
    if (inner === this.observedInner) return;

    if (this.observedInner) {
      this.resizeObserver.unobserve(this.observedInner);
    }

    this.observedInner = inner;

    if (inner) {
      this.resizeObserver.observe(inner);
      this.lastKnownHeight = readHeight(inner);
    }
  }

  private async runResize(outer: HTMLElement, fromHeight: number, toHeight: number) {
    const resizeToken = ++this.activeResizeToken;
    this.setStage('resizing');
    this.host.dispatchEvent(
      new CustomEvent(SELECTIVE_RESIZE_START_EVENT, {
        bubbles: true,
        composed: true
      })
    );

    try {
      await animateElementHeight(outer, fromHeight, toHeight);
    } finally {
      this.host.dispatchEvent(
        new CustomEvent(SELECTIVE_RESIZE_END_EVENT, {
          bubbles: true,
          composed: true
        })
      );

      if (resizeToken === this.activeResizeToken) {
        this.setStage('idle');
      }
    }
  }

  private setStage(nextStage: SelectiveResizeStage) {
    if (this.stage === nextStage) return;
    this.stage = nextStage;
    this.host.requestUpdate();
  }
}

import {LitElement, html, nothing} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import type {ContentPhase} from '../../lib/types';
import {FLOW_RESIZE_DURATION, animateElementHeight} from '../../lib/flow-motion';
import {SELECTIVE_RESIZE_END_EVENT, SELECTIVE_RESIZE_START_EVENT} from '../../lib/selective-resize-controller';

const COPY_EASE = 'cubic-bezier(0.2, 0.9, 0.24, 1)';

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
}

function normalizeText(value: string | null | undefined) {
  return String(value || '').trim();
}

type CopyMotionMode = 'idle' | 'out' | 'enter' | 'change' | 'exit';

@customElement('slide-image-copy-motion')
export class SlideImageCopyMotion extends LitElement {
  @property({type: String}) description = '';
  @property({type: String, attribute: 'comparison-description'}) comparisonDescription = '';
  @property({type: String}) bodyPhase: ContentPhase = 'idle';
  @property({type: Boolean}) active = false;

  @state() private currentText = '';
  @state() private mode: CopyMotionMode = 'idle';
  @state() private revealActive = true;

  @query('.slide-image-copy-motion__viewport') private viewportElement!: HTMLElement;
  @query('.slide-image-copy-motion__measure--current') private currentMeasureElement!: HTMLElement;
  @query('.slide-image-copy-motion__measure--comparison') private comparisonMeasureElement!: HTMLElement;

  private transitionToken = 0;
  private localAnimating = false;

  protected createRenderRoot() {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.syncIdle(normalizeText(this.description));
  }

  protected updated(changed: Map<string, unknown>) {
    const description = normalizeText(this.description);
    const comparisonDescription = normalizeText(this.comparisonDescription);
    const relevantChange =
      changed.has('description') || changed.has('comparisonDescription') || changed.has('bodyPhase') || changed.has('active');

    if (!relevantChange) return;

    if (!this.active) {
      if (!this.localAnimating) {
        this.syncIdle(description);
      }
      return;
    }

    if (this.bodyPhase === 'out') {
      this.localAnimating = false;
      this.currentText = description;
      this.revealActive = true;
      this.mode = description ? 'out' : 'idle';
      return;
    }

    if (this.bodyPhase === 'in') {
      void this.runInTransition(comparisonDescription, description);
      return;
    }

    if (this.bodyPhase === 'idle' && !this.localAnimating) {
      this.syncIdle(description);
    }
  }

  private syncIdle(text: string) {
    this.currentText = text;
    this.mode = 'idle';
    this.revealActive = true;
  }

  private readMeasuredHeight(element: HTMLElement | null) {
    if (!element) return 0;
    return Math.ceil(element.getBoundingClientRect().height || element.scrollHeight);
  }

  private dispatchResizeEvent(name: string) {
    this.dispatchEvent(
      new CustomEvent(name, {
        bubbles: true,
        composed: true
      })
    );
  }

  private async runInTransition(fromText: string, toText: string) {
    const token = ++this.transitionToken;

    if (fromText === toText) {
      this.localAnimating = false;
      this.syncIdle(toText);
      return;
    }

    const nextMode: CopyMotionMode = !fromText && toText ? 'enter' : fromText && !toText ? 'exit' : 'change';

    this.localAnimating = true;
    this.currentText = toText;
    this.mode = nextMode;
    this.revealActive = !toText;
    await this.updateComplete;

    if (token !== this.transitionToken) return;

    const fromHeight = this.readMeasuredHeight(this.comparisonMeasureElement);
    const toHeight = this.readMeasuredHeight(this.currentMeasureElement);
    const hasHeightChange = Math.abs(toHeight - fromHeight) >= 1;

    if (hasHeightChange) {
      this.dispatchResizeEvent(SELECTIVE_RESIZE_START_EVENT);
    }

    let resizePromise: Promise<boolean> = Promise.resolve(false);

    try {
      if (hasHeightChange) {
        resizePromise = animateElementHeight(this.viewportElement, fromHeight, toHeight, FLOW_RESIZE_DURATION, COPY_EASE);
      }

      if (toText) {
        await nextFrame();
        if (token !== this.transitionToken) return;

        this.revealActive = true;
        await this.updateComplete;
      }

      await Promise.all([resizePromise, wait(FLOW_RESIZE_DURATION)]);
    } finally {
      if (hasHeightChange) {
        this.dispatchResizeEvent(SELECTIVE_RESIZE_END_EVENT);
      }
    }

    if (token !== this.transitionToken) return;

    this.localAnimating = false;
    this.syncIdle(toText);
  }

  render() {
    const hasCurrent = Boolean(this.currentText);
    const currentDescription = normalizeText(this.description);
    const comparisonDescription = normalizeText(this.comparisonDescription);

    return html`
      <div class="slide-image-copy-motion" data-mode=${this.mode} data-reveal=${this.revealActive ? 'active' : 'idle'}>
        <div class="slide-image-copy-motion__viewport ${hasCurrent ? 'is-populated' : ''}">
          ${hasCurrent ? html`<div class="slide-image-copy-motion__spacing" aria-hidden="true"></div>` : nothing}
          ${hasCurrent ? html`<p class="slide-body slide-image__description slide-image-copy-motion__current">${this.currentText}</p>` : nothing}
        </div>

        <div
          class="slide-body slide-image__description slide-image-copy-motion__measure slide-image-copy-motion__measure--current ${currentDescription ? 'is-populated' : ''}"
        >
          ${currentDescription ? html`<div class="slide-image-copy-motion__spacing" aria-hidden="true"></div>` : nothing}
          ${currentDescription}
        </div>
        <div
          class="slide-body slide-image__description slide-image-copy-motion__measure slide-image-copy-motion__measure--comparison ${comparisonDescription ? 'is-populated' : ''}"
        >
          ${comparisonDescription ? html`<div class="slide-image-copy-motion__spacing" aria-hidden="true"></div>` : nothing}
          ${comparisonDescription}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'slide-image-copy-motion': SlideImageCopyMotion;
  }
}

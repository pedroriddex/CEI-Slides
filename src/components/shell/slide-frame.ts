import {LitElement, html, nothing} from 'lit';
import type {TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import type {ContentPhase, Direction, SlideDocument, SlideFrameProps} from '../../lib/types';
import {cssUrlValue, resolveAssetPath} from '../../lib/assets';
import '../templates/slide-renderer';

interface PanelEntry {
  slide: SlideDocument;
  phase: 'enter' | 'exit' | 'idle';
  media: boolean;
  comparisonSlide: SlideDocument | null;
  bodyPhase: ContentPhase;
}

@customElement('slide-frame-shell')
export class SlideFrameShell extends LitElement implements SlideFrameProps {
  @property({attribute: false}) slide!: SlideDocument;
  @property({attribute: false}) previousSlide: SlideDocument | null = null;
  @property({attribute: false}) comparisonSlide: SlideDocument | null = null;
  @property({type: String}) bodyPhase: ContentPhase = 'idle';
  @property({type: Boolean}) motionActive = false;
  @property({type: String}) slug = '';
  @property({type: String}) accentColor = '';
  @property({attribute: false}) toolbar: TemplateResult | typeof nothing = nothing;
  @property({attribute: 'transition-kind', type: String}) transitionKind: 'idle' | 'whole-layout' | 'whole-same-layout' = 'idle';
  @property({attribute: 'transition-phase', type: String}) transitionPhase: 'idle' | 'exit' | 'layout' | 'enter' = 'idle';
  @property({type: String}) direction: Direction = 'forward';

  protected createRenderRoot() {
    return this;
  }

  private layoutFor(slide: SlideDocument | null) {
    const isCover = slide?.template === 'cover';
    const isOpen = Boolean(slide && !isCover && slide.sideblockopen);

    return {
      isCover,
      isOpen,
      leftHasContent: Boolean(slide && (isCover || !isOpen)),
      rightHasContent: Boolean(slide && !isCover && isOpen)
    };
  }

  private renderSlideContent(
    slide: SlideDocument,
    phase: 'enter' | 'exit' | 'idle',
    comparisonSlide: SlideDocument | null = null,
    bodyPhase: ContentPhase = 'idle'
  ) {
    const className = [
      'slide-frame__panel-content',
      phase === 'enter'
        ? `slide-frame__panel-content--enter-${this.direction}`
        : phase === 'exit'
          ? `slide-frame__panel-content--exit-${this.direction}`
          : 'slide-frame__panel-content--idle'
    ].join(' ');

    return html`
      <div class=${className}>
        <div class="slide-frame__panel-inner">
          <slide-renderer
            .slide=${slide}
            .slug=${this.slug}
            .comparisonSlide=${comparisonSlide}
            .bodyPhase=${bodyPhase}
            .motionActive=${this.motionActive}
            .direction=${this.direction}
          ></slide-renderer>
        </div>
      </div>
    `;
  }

  private renderCoverMedia(slide: SlideDocument, phase: 'enter' | 'exit' | 'idle') {
    const coverAsset = slide.coverImg ? resolveAssetPath(this.slug, slide.coverImg) : '';
    const backgroundImage = cssUrlValue(coverAsset);
    const className = [
      'slide-frame__panel-content',
      'slide-frame__panel-content--media',
      phase === 'enter'
        ? `slide-frame__panel-content--enter-${this.direction}`
        : phase === 'exit'
          ? `slide-frame__panel-content--exit-${this.direction}`
          : 'slide-frame__panel-content--idle'
    ].join(' ');

    // The background image is routed through a CSS custom property so the
    // value (already sanitised by cssUrlValue) cannot break out of the
    // declaration and inject further CSS properties.
    const mediaStyle = backgroundImage ? `--cover-asset: ${backgroundImage};` : '';

    return html`
      <div class=${className}>
        <div
          class="slide-frame__panel-media"
          style=${mediaStyle}
          ?data-empty=${!backgroundImage}
        ></div>
      </div>
    `;
  }

  render() {
    const isWholeFrameTransition = this.transitionPhase !== 'idle';
    const outgoingSlide = isWholeFrameTransition && this.transitionPhase === 'exit' ? this.previousSlide : null;
    const incomingSlide = isWholeFrameTransition && (this.transitionPhase === 'enter' || this.transitionPhase === 'idle') ? this.slide : null;
    const layoutSource = this.transitionPhase === 'exit' && this.previousSlide ? this.previousSlide : this.slide;
    const layout = this.layoutFor(layoutSource);

    const slideShellClass = layout.isCover
      ? 'slide-frame__app slide-frame__app--cover'
      : layout.isOpen
        ? 'slide-frame__app slide-frame__app--right'
        : 'slide-frame__app slide-frame__app--left';

    const rootClass = [
      'slide-frame',
      `slide-frame--phase-${this.transitionPhase}`,
      `slide-frame--dir-${this.direction}`
    ].join(' ');

    // Each panel renders its slides through `repeat`, keyed by the slide
    // object. That way the incoming slide keeps the same DOM node when the
    // transition goes from 'enter' to 'idle' instead of being torn down and
    // rebuilt (which made iframes reload and flicker).
    const canvasEntries: PanelEntry[] = [];
    const blockEntries: PanelEntry[] = [];
    const addEntries = (
      slide: SlideDocument,
      phase: PanelEntry['phase'],
      comparisonSlide: SlideDocument | null = null,
      bodyPhase: ContentPhase = 'idle'
    ) => {
      const slideLayout = this.layoutFor(slide);
      if (slideLayout.leftHasContent) canvasEntries.push({slide, phase, media: false, comparisonSlide, bodyPhase});
      if (slideLayout.isCover) blockEntries.push({slide, phase, media: true, comparisonSlide, bodyPhase});
      else if (slideLayout.rightHasContent) blockEntries.push({slide, phase, media: false, comparisonSlide, bodyPhase});
    };

    if (isWholeFrameTransition) {
      if (outgoingSlide) addEntries(outgoingSlide, 'exit');
      if (incomingSlide) addEntries(incomingSlide, this.transitionPhase === 'enter' ? 'enter' : 'idle');
    } else {
      addEntries(this.slide, 'idle', this.comparisonSlide, this.bodyPhase);
    }

    const renderEntry = (entry: PanelEntry) =>
      entry.media
        ? this.renderCoverMedia(entry.slide, entry.phase)
        : this.renderSlideContent(entry.slide, entry.phase, entry.comparisonSlide, entry.bodyPhase);

    return html`
      <div class="wrap--containter">
        <article class=${rootClass} style=${`--slide-accent: ${this.accentColor};`}>
          <div class=${slideShellClass}>
            <div class="slide-frame__panel slide-frame__panel--canvas ${layout.leftHasContent ? 'slide-frame__panel--content' : 'slide-frame__panel--empty'}">
              ${repeat(canvasEntries, (entry) => entry.slide, renderEntry)}
            </div>

            <div class="slide-frame__panel slide-frame__panel--block ${layout.isCover ? 'slide-frame__panel--media' : layout.rightHasContent ? 'slide-frame__panel--content' : 'slide-frame__panel--empty'}">
              ${repeat(blockEntries, (entry) => entry.slide, renderEntry)}
            </div>
          </div>

          ${this.toolbar}
        </article>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'slide-frame-shell': SlideFrameShell;
  }
}

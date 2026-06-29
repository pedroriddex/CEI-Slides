import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {ContentPhase, Direction, SlideDocument, SlideTemplateProps} from '../../lib/types';
import {hasText, validTimelineSegments} from '../../lib/content-helpers';
import {createPhasedItems, resolveSelectivePhase, timelineSegmentKey} from '../../lib/slide-transition';
import '../blocks/motion-auto-size';
import '../blocks/slide-heading';
import '../blocks/timeline-block';

@customElement('slide-timeline-template')
export class SlideTimelineTemplate extends LitElement implements SlideTemplateProps {
  @property({attribute: false}) slide!: SlideDocument;
  @property({type: String}) slug = '';
  @property({attribute: false}) comparisonSlide: SlideDocument | null = null;
  @property({type: String}) bodyPhase: ContentPhase = 'idle';
  @property({type: Boolean}) motionActive = false;
  @property({type: String}) direction: Direction = 'forward';

  protected createRenderRoot() {
    return this;
  }

  render() {
    const slide = this.slide;
    const comparison = this.comparisonSlide;
    const segments = createPhasedItems(
      this.bodyPhase,
      validTimelineSegments(slide.timeline || []),
      validTimelineSegments(comparison?.timeline || []),
      timelineSegmentKey
    );
    const hasBody = hasText(slide.description) || segments.length > 0 || hasText(slide.postDescription);
    const titlePhase = resolveSelectivePhase(this.bodyPhase, slide.title || '', comparison?.title || '');
    const iconPhase = resolveSelectivePhase(this.bodyPhase, slide.icon || '', comparison?.icon || '');
    const descriptionPhase = resolveSelectivePhase(this.bodyPhase, slide.description || '', comparison?.description || '');
    const postDescriptionPhase = resolveSelectivePhase(this.bodyPhase, slide.postDescription || '', comparison?.postDescription || '');

    return html`
      <div class="slide-timeline">
        <div class="slide-timeline__content">
          ${hasText(slide.title) || hasText(slide.icon)
            ? html`<slide-heading-block .headingTitle=${slide.title || ''} .icon=${slide.icon || null} kind="section" .titlePhase=${titlePhase} .iconPhase=${iconPhase} .direction=${this.direction}></slide-heading-block>`
            : nothing}
          ${hasBody
            ? html`
                <motion-auto-size
                  outer-class="slide-timeline__body"
                  inner-class="slide-timeline__body-inner"
                  .active=${this.motionActive}
                  .content=${html`
                    ${slide.description
                      ? html`
                          <div data-flow-key="description">
                            <p class="slide-body slide-motion-shell slide-motion-shell--${descriptionPhase} slide-motion-shell--${this.direction}">${slide.description}</p>
                          </div>
                        `
                      : nothing}
                    ${segments.length
                      ? html`<div data-flow-key="timeline"><timeline-block .items=${segments} .motionActive=${this.motionActive} .direction=${this.direction}></timeline-block></div>`
                      : nothing}
                    ${slide.postDescription
                      ? html`
                          <div data-flow-key="post-description">
                            <p class="slide-body slide-motion-shell slide-motion-shell--${postDescriptionPhase} slide-motion-shell--${this.direction}">${slide.postDescription}</p>
                          </div>
                        `
                      : nothing}
                  `}
                ></motion-auto-size>
              `
            : nothing}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'slide-timeline-template': SlideTimelineTemplate;
  }
}

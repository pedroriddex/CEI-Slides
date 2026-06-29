import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import type {Direction, PhasedItem, TimelineSegment} from '../../lib/types';
import {colorValue} from '../../lib/theme';
import {isPhasedActive, motionShellClass} from '../../lib/phased-motion';
import './motion-auto-size';

@customElement('timeline-block')
export class TimelineBlock extends LitElement {
  @property({attribute: false}) items: PhasedItem<TimelineSegment>[] = [];
  @property({type: Boolean}) motionActive = false;
  @property({type: String}) direction: Direction = 'forward';

  protected createRenderRoot() {
    return this;
  }

  render() {
    if (!this.items.length) return nothing;

    return html`
      <motion-auto-size
        inner-class="timeline"
        .active=${isPhasedActive(this.items, this.motionActive)}
        .content=${html`
          ${repeat(
            this.items,
            (entry) => entry.key,
            (entry) => {
              const segment = entry.item;
              const span = segment.span && segment.span > 0 ? segment.span : 1;
              return html`
                <div
                  data-flow-key=${entry.key}
                  class=${motionShellClass(entry, this.direction, 'timeline__segment')}
                  style="--timeline-accent:${colorValue(segment.color || 'black')};--timeline-span:${span}"
                >
                  <span class="timeline__track" aria-hidden="true"><span class="timeline__node"></span></span>
                  <div class="timeline__text">
                    ${segment.meta ? html`<span class="timeline__meta">${segment.meta}</span>` : nothing}
                    ${segment.label
                      ? html`<span class="timeline__label">${segment.icon ? html`<i class="${segment.icon} timeline__icon"></i>` : nothing}${segment.label}</span>`
                      : nothing}
                    ${segment.caption ? html`<span class="timeline__caption">${segment.caption}</span>` : nothing}
                  </div>
                </div>
              `;
            }
          )}
        `}
      ></motion-auto-size>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'timeline-block': TimelineBlock;
  }
}

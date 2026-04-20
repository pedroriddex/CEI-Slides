import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import type {Direction, ListItem, PhasedItem} from '../../lib/types';
import './motion-auto-size';

@customElement('number-list-block')
export class NumberListBlock extends LitElement {
  @property({attribute: false}) items: PhasedItem<ListItem>[] = [];
  @property({type: Boolean}) motionActive = false;
  @property({type: String}) direction: Direction = 'forward';

  protected createRenderRoot() {
    return this;
  }

  render() {
    if (!this.items.length) return nothing;

    return html`
      <motion-auto-size
        inner-class="slide-number-list"
        .active=${this.motionActive || this.items.some((entry) => entry.phase !== 'idle')}
        .content=${html`
          ${repeat(
            this.items,
            (entry) => entry.key,
            (entry, index) => html`
              <div data-flow-key=${entry.key} class="slide-number-list__item slide-motion-shell slide-motion-shell--${entry.phase} slide-motion-shell--${this.direction}">
                <span class="slide-number-list__number">${entry.item.num || index + 1}</span>
                <div class="slide-number-list__body">
                  ${entry.item.title ? html`<span class="slide-number-list__title">${entry.item.title}</span>` : nothing}
                  ${entry.item.description ? html`<span class="slide-number-list__description">${entry.item.description}</span>` : nothing}
                </div>
              </div>
            `
          )}
        `}
      ></motion-auto-size>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'number-list-block': NumberListBlock;
  }
}

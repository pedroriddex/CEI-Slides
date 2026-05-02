import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import type {Direction, ListItem, PhasedItem} from '../../lib/types';
import {isPhasedActive, motionShellClass} from '../../lib/phased-motion';
import './motion-auto-size';

@customElement('normal-list-block')
export class NormalListBlock extends LitElement {
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
        inner-class="slide-normal-list"
        .active=${isPhasedActive(this.items, this.motionActive)}
        .content=${html`
          ${repeat(
            this.items,
            (entry) => entry.key,
            (entry) => html`
              <div data-flow-key=${entry.key} class=${motionShellClass(entry, this.direction, 'slide-normal-list__item')}>
                <div class="slide-normal-list__row">
                  <span class="slide-normal-list__bullet"></span>
                  ${entry.item.title ? html`<span class="slide-normal-list__title">${entry.item.title}</span>` : nothing}
                </div>
                ${entry.item.description ? html`<span class="slide-normal-list__description">${entry.item.description}</span>` : nothing}
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
    'normal-list-block': NormalListBlock;
  }
}

import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import type {Direction, IconItem, PhasedItem} from '../../lib/types';
import './motion-auto-size';

@customElement('icon-list-block')
export class IconListBlock extends LitElement {
  @property({attribute: false}) items: PhasedItem<IconItem>[] = [];
  @property({type: Boolean}) separator = false;
  @property({type: Boolean}) spaced = false;
  @property({type: Boolean}) magic = false;
  @property({type: Boolean}) motionActive = false;
  @property({type: String}) direction: Direction = 'forward';

  protected createRenderRoot() {
    return this;
  }

  render() {
    if (!this.items.length) return nothing;

    if (this.magic) {
      return html`
        <motion-auto-size
          inner-class="magicbox__icon-list ${this.spaced ? 'magicbox__icon-list--space' : ''}"
          .active=${this.motionActive || this.items.some((entry) => entry.phase !== 'idle')}
          .content=${html`
            ${repeat(
              this.items,
              (entry) => entry.key,
              (entry, index) => html`
                <span data-flow-key=${entry.key} class="slide-motion-shell slide-motion-shell--${entry.phase} slide-motion-shell--${this.direction}">
                  <i class="${entry.item.icon || ''} magicbox__icon-list-item"></i>
                </span>
                ${this.separator && index < this.items.length - 1 ? html`<span class="magicbox__icon-list-line"></span>` : nothing}
              `
            )}
          `}
        ></motion-auto-size>
      `;
    }

    return html`
      <motion-auto-size
        inner-class="slide-icon-list"
        .active=${this.motionActive || this.items.some((entry) => entry.phase !== 'idle')}
        .content=${html`
          ${repeat(
            this.items,
            (entry) => entry.key,
            (entry, index) => html`
              <span data-flow-key=${entry.key} class="slide-motion-shell slide-motion-shell--${entry.phase} slide-motion-shell--${this.direction}">
                <i class="${entry.item.icon || ''} slide-icon-list__icon"></i>
              </span>
              ${this.separator && index < this.items.length - 1 ? html`<span class="slide-icon-list__separator"></span>` : nothing}
            `
          )}
        `}
      ></motion-auto-size>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'icon-list-block': IconListBlock;
  }
}

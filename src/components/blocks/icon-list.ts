import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import type {Direction, IconItem, PhasedItem} from '../../lib/types';
import {isPhasedActive, motionShellClass} from '../../lib/phased-motion';
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

    const innerClass = this.magic
      ? `magicbox__icon-list ${this.spaced ? 'magicbox__icon-list--space' : ''}`
      : 'slide-icon-list';
    const itemIconClass = this.magic ? 'magicbox__icon-list-item' : 'slide-icon-list__icon';
    const separatorClass = this.magic ? 'magicbox__icon-list-line' : 'slide-icon-list__separator';

    return html`
      <motion-auto-size
        inner-class=${innerClass}
        .active=${isPhasedActive(this.items, this.motionActive)}
        .content=${html`
          ${repeat(
            this.items,
            (entry) => entry.key,
            (entry, index) => html`
              <span data-flow-key=${entry.key} class=${motionShellClass(entry, this.direction)}>
                <i class="${entry.item.icon || ''} ${itemIconClass}"></i>
              </span>
              ${this.separator && index < this.items.length - 1 ? html`<span class=${separatorClass}></span>` : nothing}
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

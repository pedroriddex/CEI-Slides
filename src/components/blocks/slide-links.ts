import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import type {Direction, LinkItem, PhasedItem} from '../../lib/types';
import {normalizeUrl} from '../../lib/assets';
import './motion-auto-size';

@customElement('slide-links-block')
export class SlideLinksBlock extends LitElement {
  @property({attribute: false}) links: PhasedItem<LinkItem>[] = [];
  @property({type: Boolean}) magic = false;
  @property({type: Boolean}) motionActive = false;
  @property({type: String}) direction: Direction = 'forward';

  protected createRenderRoot() {
    return this;
  }

  render() {
    if (!this.links.length) return nothing;

    const containerClass = this.magic ? 'magicbox__links' : 'slide-links';
    const itemClass = this.magic ? 'magicbox__link' : 'slide-links__item';
    const iconClass = this.magic ? 'ri-link-m' : 'ri-link-m slide-links__icon';

    return html`
      <motion-auto-size
        inner-class=${containerClass}
        .active=${this.motionActive || this.links.some((entry) => entry.phase !== 'idle')}
        .content=${html`
          ${repeat(
            this.links,
            (entry) => entry.key,
            (entry) => {
              const href = normalizeUrl(entry.item.link) || '#';
              const label = entry.item.title || entry.item.link || 'Abrir enlace';
              return html`
                <a data-flow-key=${entry.key} href=${href} target="_blank" rel="noreferrer" class="${itemClass} slide-motion-shell slide-motion-shell--${entry.phase} slide-motion-shell--${this.direction}">
                  <i class=${iconClass}></i>
                  ${label}
                </a>
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
    'slide-links-block': SlideLinksBlock;
  }
}

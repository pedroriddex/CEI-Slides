import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import type {Direction, LinkItem, PhasedItem} from '../../lib/types';
import {normalizeUrl} from '../../lib/assets';
import {isPhasedActive, motionShellClass} from '../../lib/phased-motion';
import {strings} from '../../lib/i18n';
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
        .active=${isPhasedActive(this.links, this.motionActive)}
        .content=${html`
          ${repeat(
            this.links,
            (entry) => entry.key,
            (entry) => {
              const href = normalizeUrl(entry.item.link) || '#';
              const label = entry.item.title || entry.item.link || strings.links.fallbackLabel;
              return html`
                <a
                  data-flow-key=${entry.key}
                  href=${href}
                  target="_blank"
                  rel="noopener noreferrer"
                  class=${motionShellClass(entry, this.direction, itemClass)}
                >
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

import {LitElement, html, nothing} from 'lit';
import type {TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {BreadcrumbItem} from '../../lib/types';

@customElement('index-frame-shell')
export class IndexFrameShell extends LitElement {
  @property({attribute: 'frame-title', type: String}) frameTitle = '';
  @property({type: String}) subtitle: string | null = null;
  @property({type: String}) meta: string | null = null;
  @property({attribute: false}) breadcrumbs: BreadcrumbItem[] = [];
  @property({attribute: false}) onNavigate: (path: string) => void = () => undefined;
  @property({attribute: false}) content: TemplateResult | typeof nothing = nothing;
  @property({attribute: 'motion-state', type: String}) motionState: 'idle' | 'enter' = 'idle';

  protected createRenderRoot() {
    return this;
  }

  render() {
    const frameClass = this.motionState === 'enter' ? 'index-frame index-frame--motion-enter' : 'index-frame';

    return html`
      <div class=${frameClass}>
        <div class="index-frame__app">
          <div class="index-frame__context">
            <div class="index-frame__copy">
              <h1 class="index-frame__title">${this.frameTitle}</h1>
              ${this.breadcrumbs.length
                ? html`
                    <nav class="index-breadcrumbs" aria-label="Breadcrumb">
                      ${this.breadcrumbs.map((item, index) => html`
                        ${index > 0 ? html`<span class="index-breadcrumbs__separator" aria-hidden="true">/</span>` : nothing}
                        ${item.current
                          ? html`<span class="index-breadcrumbs__item index-breadcrumbs__item--current">${item.label}</span>`
                          : html`<button type="button" class="index-breadcrumbs__item" @click=${() => this.onNavigate(item.path)}>${item.label}</button>`}
                      `)}
                    </nav>
                  `
                : nothing}
              ${this.subtitle ? html`<p class="index-frame__subtitle">${this.subtitle}</p>` : nothing}
            </div>
            ${this.content}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'index-frame-shell': IndexFrameShell;
  }
}

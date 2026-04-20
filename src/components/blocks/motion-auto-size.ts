import {LitElement, type TemplateResult, html, nothing} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {SelectiveResizeController} from '../../lib/selective-resize-controller';

@customElement('motion-auto-size')
export class MotionAutoSize extends LitElement {
  @property({attribute: false}) content: TemplateResult | typeof nothing = nothing;
  @property({type: String, attribute: 'outer-class'}) outerClass = '';
  @property({type: String, attribute: 'inner-class'}) innerClass = '';
  @property({type: Boolean}) active = false;

  @query('.motion-auto-size') private outerElement!: HTMLElement;
  @query('.motion-auto-size__inner') private innerElement!: HTMLElement;
  private readonly selectiveResize = new SelectiveResizeController(this, {
    getOuter: () => this.outerElement ?? null,
    getInner: () => this.innerElement ?? null
  });

  protected createRenderRoot() {
    return this;
  }

  render() {
    const outerClass = ['motion-auto-size', this.outerClass].filter(Boolean).join(' ');
    const innerClass = ['motion-auto-size__inner', this.innerClass].filter(Boolean).join(' ');

    return html`
      <div class=${outerClass} data-resize-stage=${this.selectiveResize.stage}>
        <div class=${innerClass}>
          ${this.content}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'motion-auto-size': MotionAutoSize;
  }
}

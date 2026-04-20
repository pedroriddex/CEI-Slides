import {LitElement, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {BreadcrumbItem, IndexDocument, IndexItem} from '../lib/types';
import {colorValue} from '../lib/theme';
import './shell/index-frame';
import './blocks/index-link-row';

@customElement('content-index')
export class ContentIndex extends LitElement {
  @property({attribute: false}) document!: IndexDocument;
  @property({attribute: false}) onNavigate: (path: string) => void = () => undefined;
  @property({attribute: false}) breadcrumbs: BreadcrumbItem[] = [];
  @property({type: String}) backPath = '';
  @property({type: String}) eyebrow = 'Índice';
  @property({type: String}) versionId = '';
  @state() private motionState: 'idle' | 'enter' = 'enter';
  private motionTimeout: number | null = null;

  protected createRenderRoot() {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.triggerEnterMotion();
  }

  disconnectedCallback(): void {
    if (this.motionTimeout !== null) {
      window.clearTimeout(this.motionTimeout);
      this.motionTimeout = null;
    }
    super.disconnectedCallback();
  }

  protected updated(changed: Map<string, unknown>) {
    if (changed.has('document')) {
      const previous = changed.get('document') as IndexDocument | undefined;
      if (!previous || previous.path !== this.document.path) {
        this.triggerEnterMotion();
      }
    }
  }

  private triggerEnterMotion() {
    if (this.motionTimeout !== null) {
      window.clearTimeout(this.motionTimeout);
      this.motionTimeout = null;
    }

    this.motionState = 'idle';

    requestAnimationFrame(() => {
      this.motionState = 'enter';
      this.motionTimeout = window.setTimeout(() => {
        this.motionState = 'idle';
        this.motionTimeout = null;
      }, 560);
    });
  }

  private renderItem(item: IndexItem, index: number) {
    const target = item.target || '_self';
    const accentColor = colorValue(item.color);

    return html`
      <index-link-row
        style=${`--item-index: ${index};`}
        label=${item.title}
        .icon=${item.icon || null}
        .href=${target === '_self' ? null : item.href}
        .target=${target}
        .disabled=${Boolean(item.disabled)}
        .accentColor=${accentColor}
        variant="primary-grid"
        .onActivate=${target === '_self' && !item.disabled ? () => this.onNavigate(item.href) : null}
      ></index-link-row>
    `;
  }

  render() {
    const doc = this.document;
    const content = doc.items.length > 0
      ? html`
          <div class="index-list__scroll">
            <div class="index-list">
              ${doc.items.map((item, index) => this.renderItem(item, index))}
            </div>
          </div>

          ${this.backPath
            ? html`
                <button class="index-back" @click=${() => this.onNavigate(this.backPath)}>
                  <i class="ri-arrow-left-line"></i>
                  Volver atrás
                </button>
              `
            : nothing}
        `
      : html`
          <div class="index-empty">
            <i class="ri-emotion-sad-line"></i>
            Aquí no hay nada, de momento.
          </div>

          ${this.backPath
            ? html`
                <button class="index-back" @click=${() => this.onNavigate(this.backPath)}>
                  <i class="ri-arrow-left-line"></i>
                  Atrás
                </button>
              `
            : nothing}
        `;

    return html`
      <index-frame-shell
        .frameTitle=${doc.meta.title}
        .subtitle=${doc.meta.subtitle || null}
        .breadcrumbs=${this.breadcrumbs}
        .onNavigate=${(path: string) => this.onNavigate(path)}
        .content=${content}
        motion-state=${this.motionState}
      ></index-frame-shell>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'content-index': ContentIndex;
  }
}

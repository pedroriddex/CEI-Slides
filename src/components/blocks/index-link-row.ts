import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {IndexRowProps, NavRowVariant} from '../../lib/types';

@customElement('index-link-row')
export class IndexLinkRow extends LitElement implements IndexRowProps {
  @property({type: String}) label = '';
  @property({type: String}) icon: string | null = null;
  @property({type: String}) leadingText: string | null = null;
  @property({type: String}) trailingIcon: string | null = null;
  @property({type: String}) href: string | null = null;
  @property({type: String}) target: string | null = null;
  @property({type: Boolean}) disabled: boolean | null = null;
  @property({type: Boolean}) active = false;
  @property({type: String}) accentColor: string | null = null;
  @property({type: String}) variant: NavRowVariant = 'primary';
  @property({attribute: false}) onActivate: (() => void) | null = null;

  protected createRenderRoot() {
    return this;
  }

  private get styleValue() {
    return this.accentColor ? `--index-accent: ${this.accentColor};` : '';
  }

  private get rowClassName() {
    return `index-link-row index-link-row--${this.variant} ${this.active ? 'index-link-row--active' : ''} ${this.disabled ? 'index-link-row--disabled' : ''}`.trim();
  }

  private renderInner() {
    return html`
      ${this.leadingText ? html`<span class="index-link-row__leading">${this.leadingText}</span>` : nothing}
      ${this.icon ? html`<i class="${this.icon} index-link-row__icon"></i>` : nothing}
      <span class="index-link-row__copy">
        <span class="index-link-row__label">${this.label}</span>
      </span>
      ${this.trailingIcon ? html`<i class="${this.trailingIcon} index-link-row__trailing-icon"></i>` : nothing}
    `;
  }

  render() {
    if (this.disabled) {
      return html`<div class=${this.rowClassName} style=${this.styleValue}>${this.renderInner()}</div>`;
    }

    if (this.onActivate) {
      return html`<button type="button" class=${this.rowClassName} style=${this.styleValue} @click=${this.onActivate}>${this.renderInner()}</button>`;
    }

    if (this.href) {
      return html`
        <a class=${this.rowClassName} style=${this.styleValue} href=${this.href} target=${this.target || '_self'} rel=${this.target && this.target !== '_self' ? 'noopener noreferrer' : nothing}>
          ${this.renderInner()}
        </a>
      `;
    }

    return html`<div class=${this.rowClassName} style=${this.styleValue}>${this.renderInner()}</div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'index-link-row': IndexLinkRow;
  }
}

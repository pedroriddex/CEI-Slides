import {LitElement, html, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import './components/content-index';
import './components/deck-viewer';
import {loadContent} from './lib/content-source';
import {getDeckDocument, getDocument, getIndexDocument, normalizePath, resolveParentPath, type DocumentMap} from './lib/content-registry';
import {readRoute, writeRoute} from './lib/router';
import type {BreadcrumbItem} from './lib/types';
import {applyStudioPreviewPayload, type StudioPreviewLivePayload} from './lib/studio-preview';

@customElement('app-root')
export class AppRoot extends LitElement {
  @state() private path = '';
  @state() private slide = 0;
  @state() private documents: DocumentMap | null = null;
  @state() private previewDocuments: DocumentMap | null = null;
  @state() private isLoading = true;
  @state() private versionId = '';
  @state() private errorMessage = '';
  @state() private isStudioMode = false;
  @state() private studioOrigin = '';

  protected createRenderRoot() {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.syncFromLocation();
    this.syncStudioConfig();
    void this.bootstrap();
    window.addEventListener('popstate', this.syncFromLocation);
    window.addEventListener('message', this.handleStudioMessage);
    this.notifyStudioReady();
  }

  disconnectedCallback(): void {
    window.removeEventListener('popstate', this.syncFromLocation);
    window.removeEventListener('message', this.handleStudioMessage);
    super.disconnectedCallback();
  }

  private readonly syncFromLocation = () => {
    const route = readRoute();
    this.path = route.path;
    this.slide = route.slide;
  };

  private readonly syncStudioConfig = () => {
    const url = new URL(window.location.href);
    this.isStudioMode = url.searchParams.get('studio_mode') === '1';
    this.studioOrigin = (url.searchParams.get('studio_origin') || '').trim();
  };

  private notifyStudioReady() {
    if (!this.isStudioMode || window.parent === window) return;
    window.parent.postMessage({type: 'studio-preview:ready'}, '*');
  }

  private isAllowedStudioOrigin(origin: string) {
    if (!this.studioOrigin) return true;

    try {
      return new URL(this.studioOrigin).origin === origin;
    } catch {
      return true;
    }
  }

  private readonly handleStudioMessage = (event: MessageEvent) => {
    if (!this.isStudioMode) return;
    if (!this.isAllowedStudioOrigin(event.origin)) return;
    if (event.data?.type !== 'studio-preview:live') return;
    if (!this.documents) return;

    const payload = event.data.payload as StudioPreviewLivePayload | undefined;
    if (!payload) return;

    const applied = applyStudioPreviewPayload(this.documents, payload);
    this.previewDocuments = applied.documents;
    this.path = applied.path;
    this.slide = applied.slide;
  };

  private async bootstrap() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const loaded = await loadContent();
      this.documents = loaded.documents;
      this.previewDocuments = null;
      this.versionId = loaded.versionId;
    } catch (error) {
      this.documents = null;
      this.versionId = '';
      this.errorMessage = error instanceof Error ? error.message : 'No se pudo cargar el runtime público.';
    } finally {
      this.isLoading = false;
    }
  }

  private navigate(path: string) {
    writeRoute({path, slide: 0});
  }

  private updateSlide(slide: number) {
    writeRoute({path: this.path, slide}, {replace: true});
  }

  private buildBreadcrumbs(documents: DocumentMap, path: string): BreadcrumbItem[] {
    const normalizedPath = normalizePath(path);
    const breadcrumbs: BreadcrumbItem[] = [];
    if (!normalizedPath) return breadcrumbs;

    const parts = normalizedPath.split('/');
    let accumulatedPath = '';

    for (const [index, part] of parts.entries()) {
      accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part;
      const document = getDocument(documents, accumulatedPath);
      const label =
        document?.kind === 'index'
          ? document.meta.title
          : document?.kind === 'deck'
            ? document.slides[0]?.title || part
            : part;

      breadcrumbs.push({
        label,
        path: accumulatedPath,
        current: index === parts.length - 1
      });
    }

    return breadcrumbs;
  }

  private renderLoading() {
    return html`
      <main class="app-state app-state--center">
        <section class="app-state__card" aria-busy="true">
          <div class="app-state__spinner"></div>
          <div class="app-state__copy">
            <h1 class="app-state__title">Cargando contenido</h1>
            <p class="app-state__description">Consultando el runtime público de Supabase.</p>
          </div>
        </section>
      </main>
    `;
  }

  private renderLoadError() {
    return html`
      <main class="app-state app-state--center">
        <section class="app-state__card app-state__card--danger">
          <p class="app-state__eyebrow app-state__eyebrow--danger">Error remoto</p>
          <div class="app-state__copy">
            <h1 class="app-state__title">No se pudo cargar el contenido</h1>
            <p class="app-state__description">La app v2 depende completamente de Supabase y no tiene fallback local.</p>
          </div>
          <pre class="app-state__pre">${this.errorMessage}</pre>
          <div class="app-state__actions">
            <button class="app-button app-button--accent" @click=${() => void this.bootstrap()}>Reintentar</button>
            <button class="app-button app-button--secondary" @click=${() => this.navigate('')}>Ir al índice raíz</button>
          </div>
        </section>
      </main>
    `;
  }

  private renderNotFound() {
    return html`
      <main class="app-state app-state--center">
        <section class="app-state__card app-state__card--centered">
          <p class="app-state__eyebrow">404</p>
          <div class="app-state__copy">
            <h1 class="app-state__title">Contenido no encontrado</h1>
            <p class="app-state__description">La ruta solicitada no existe dentro del runtime publicado en Supabase.</p>
          </div>
          <button class="app-button app-button--accent" @click=${() => this.navigate('')}>Volver al inicio</button>
        </section>
      </main>
    `;
  }

  render() {
    if (this.isLoading) return this.renderLoading();
    if (this.errorMessage || !this.documents) return this.renderLoadError();

    const activeDocuments = this.previewDocuments ?? this.documents;

    const document = getDocument(activeDocuments, this.path);
    if (!document) return this.renderNotFound();

    if (document.kind === 'index') {
      return html`
        <content-index
          .document=${document}
          .breadcrumbs=${this.buildBreadcrumbs(activeDocuments, document.path)}
          .onNavigate=${(path: string) => this.navigate(path)}
          .backPath=${resolveParentPath(document.path)}
          .eyebrow=${document.path ? 'Índice de contenido' : 'App v2'}
          .versionId=${this.versionId}
        ></content-index>
      `;
    }

    const deck = getDeckDocument(activeDocuments, this.path);
    const parentIndex = getIndexDocument(activeDocuments, resolveParentPath(this.path));
    if (!deck) return nothing;

    return html`
      <deck-viewer
        .document=${deck}
        .slideIndex=${this.slide}
        .onSlideChange=${(slide: number) => this.updateSlide(slide)}
        .onNavigateIndex=${() => this.navigate(parentIndex?.path || '')}
        .versionId=${this.versionId}
      ></deck-viewer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-root': AppRoot;
  }
}

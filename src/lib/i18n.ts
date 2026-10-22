/**
 * Centralized UI copy.
 *
 * All user-facing strings in the runtime live here so localization,
 * copy review, or branding changes do not require touching component
 * implementations. Developer-facing error messages thrown from
 * `schema/parse.ts`, `content-registry.ts`, and `content-source.ts`
 * remain inline — those never reach end users.
 *
 * The shape is intentionally a plain frozen object. If we later add a
 * second language we can introduce a `t(key, vars)` wrapper without
 * changing the call sites, since each string is accessed via a
 * path (e.g. `strings.app.loadingTitle`).
 */

export const strings = Object.freeze({
  app: Object.freeze({
    rootTitle: 'Diapositivas v2',
    rootSubtitle: 'Contenido publicado desde el bundle estático.',
    rootEyebrow: 'App v2',
    indexEyebrow: 'Índice de contenido',
    loadingTitle: 'Cargando contenido',
    loadingDescription: 'Cargando el runtime publicado.',
    loadErrorEyebrow: 'Error de contenido',
    loadErrorTitle: 'No se pudo cargar el contenido',
    loadErrorDescription: 'La App V2 necesita un bundle publicado en /content/runtime.json.',
    loadErrorFallback: 'No se pudo cargar el runtime público.',
    notFoundTitle: 'Contenido no encontrado',
    notFoundDescription: 'La ruta solicitada no existe dentro del runtime publicado.',
    actionRetry: 'Reintentar',
    actionGoToRootIndex: 'Ir al índice raíz',
    actionBackToStart: 'Volver al inicio'
  }),
  toolbar: Object.freeze({
    controlsLabel: 'Slide controls',
    fullscreen: 'Pantalla completa',
    previous: 'Anterior',
    next: 'Siguiente',
    goToIndex: 'Ir al índice',
    indexShort: 'Índice',
    openSlides: 'Abrir listado de slides',
    slidesShort: 'Slides'
  }),
  drawer: Object.freeze({
    closeList: 'Cerrar listado de slides',
    closePanel: 'Cerrar panel',
    eyebrow: 'Slides'
  }),
  contentIndex: Object.freeze({
    defaultEyebrow: 'Índice',
    backLong: 'Volver atrás',
    backShort: 'Atrás',
    empty: 'Aquí no hay nada, de momento.'
  }),
  slides: Object.freeze({
    aboutTechnologies: 'Tecnologías',
    imageExpand: 'Ampliar imagen',
    iframeExpand: 'Ver en grande',
    downloadExample: 'Descargar proyecto de ejemplo',
    deckFallbackTitle: 'Deck'
  }),
  lightbox: Object.freeze({
    close: 'Cerrar imagen ampliada',
    closeFrame: 'Cerrar vista ampliada'
  }),
  links: Object.freeze({
    fallbackLabel: 'Abrir enlace'
  })
});

export type StringCatalog = typeof strings;

import type {
  AppDocument,
  DeckDocument,
  IconItem,
  IndexDocument,
  IndexItem,
  LinkItem,
  ListItem,
  SlideDocument,
  SlideTemplate,
  ThemeColor
} from './types';

export type DocumentMap = Map<string, AppDocument>;

interface SubjectNode {
  id?: string;
  slug?: string;
  title?: string;
  subtitle?: string;
  metadata?: Record<string, unknown> | null;
  sections?: SubjectSection[];
}

interface SubjectSection {
  id?: string;
  slug?: string;
  title?: string;
  metadata?: Record<string, unknown> | null;
  decks?: SubjectDeck[];
  subsections?: SubjectSection[];
}

interface SubjectDeck {
  id?: string;
  slug?: string;
  title?: string;
  slides?: unknown[];
}

const THEME_COLORS = new Set<ThemeColor>(['red', 'blue', 'yellow', 'black']);
const SLIDE_TEMPLATES = new Set<SlideTemplate>(['cover', 'about', 'card', 'image', 'text']);
const MAGIC_LIST_TYPES = new Set(['bullet', 'numbered']);

export function normalizePath(value = '') {
  return value.replace(/^\/+|\/+$/g, '').trim();
}

export function getDocument(documents: DocumentMap, path = '') {
  return documents.get(normalizePath(path)) ?? null;
}

export function getIndexDocument(documents: DocumentMap, path = ''): IndexDocument | null {
  const doc = getDocument(documents, path);
  return doc?.kind === 'index' ? doc : null;
}

export function getDeckDocument(documents: DocumentMap, path = ''): DeckDocument | null {
  const doc = getDocument(documents, path);
  return doc?.kind === 'deck' ? doc : null;
}

export function resolveParentPath(path = '') {
  const normalized = normalizePath(path);
  if (!normalized) return '';
  const parts = normalized.split('/');
  parts.pop();
  return parts.join('/');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asString(value: unknown, field: string, {allowEmpty = false}: {allowEmpty?: boolean} = {}) {
  if (typeof value !== 'string') {
    throw new Error(`El campo ${field} debe ser string.`);
  }

  const normalized = value.trim();
  if (!allowEmpty && !normalized) {
    throw new Error(`El campo ${field} no puede estar vacío.`);
  }

  return normalized;
}

function asOptionalString(value: unknown, field: string) {
  if (value === undefined || value === null) return null;
  return asString(value, field, {allowEmpty: true});
}

function asOptionalBoolean(value: unknown, field: string) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'boolean') {
    throw new Error(`El campo ${field} debe ser boolean.`);
  }
  return value;
}

function asOptionalThemeColor(value: unknown, field: string): ThemeColor | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'string' && THEME_COLORS.has(value as ThemeColor)) {
    return value as ThemeColor;
  }
  throw new Error(`El campo ${field} debe ser uno de: ${[...THEME_COLORS].join(', ')}.`);
}

function asThemeColorWithDefault(value: unknown, field: string): ThemeColor {
  return asOptionalThemeColor(value, field) ?? 'black';
}

function asOptionalNumberOrString(value: unknown, field: string) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number' || typeof value === 'string') return value;
  throw new Error(`El campo ${field} debe ser string o number.`);
}

function parseLinkItem(value: unknown, field: string): LinkItem {
  if (!isRecord(value)) {
    throw new Error(`El elemento ${field} debe ser un objeto.`);
  }

  return {
    title: asOptionalString(value.title, `${field}.title`),
    link: asOptionalString(value.link, `${field}.link`)
  };
}

function parseIconItem(value: unknown, field: string): IconItem {
  if (!isRecord(value)) {
    throw new Error(`El elemento ${field} debe ser un objeto.`);
  }

  return {
    icon: asOptionalString(value.icon, `${field}.icon`)
  };
}

function parseListItem(value: unknown, field: string): ListItem {
  if (!isRecord(value)) {
    throw new Error(`El elemento ${field} debe ser un objeto.`);
  }

  return {
    num: asOptionalString(value.num, `${field}.num`),
    title: asOptionalString(value.title, `${field}.title`),
    description: asOptionalString(value.description, `${field}.description`)
  };
}

function parseArray<T>(value: unknown, field: string, parseItem: (value: unknown, field: string) => T): T[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    throw new Error(`El campo ${field} debe ser un array.`);
  }

  return value.map((item, index) => parseItem(item, `${field}[${index}]`));
}

function parseSlideDocument(value: unknown, field: string): SlideDocument {
  if (!isRecord(value)) {
    throw new Error(`La slide ${field} debe ser un objeto.`);
  }

  const template = asString(value.template, `${field}.template`);
  if (!SLIDE_TEMPLATES.has(template as SlideTemplate)) {
    throw new Error(`La slide ${field}.template no es válida.`);
  }

  const mgListType = value.mgListType;
  if (mgListType !== undefined && mgListType !== null && (typeof mgListType !== 'string' || !MAGIC_LIST_TYPES.has(mgListType))) {
    throw new Error(`El campo ${field}.mgListType debe ser 'bullet' o 'numbered'.`);
  }

  return {
    template: template as SlideTemplate,
    theme: asOptionalNumberOrString(value.theme, `${field}.theme`),
    slug: asOptionalString(value.slug, `${field}.slug`),
    color: asOptionalThemeColor(value.color, `${field}.color`),
    subtemplate: asOptionalString(value.subtemplate, `${field}.subtemplate`),
    sideblockopen: asOptionalBoolean(value.sideblockopen, `${field}.sideblockopen`),
    showThemeNumber: asOptionalBoolean(value.showThemeNumber, `${field}.showThemeNumber`),
    title: asOptionalString(value.title, `${field}.title`),
    description: asOptionalString(value.description, `${field}.description`),
    icon: asOptionalString(value.icon, `${field}.icon`),
    postDescription: asOptionalString(value.postDescription, `${field}.postDescription`),
    listItems: parseArray(value.listItems, `${field}.listItems`, parseListItem),
    list: parseArray(value.list, `${field}.list`, parseListItem),
    iconList: parseArray(value.iconList, `${field}.iconList`, parseIconItem),
    linksList: parseArray(value.linksList, `${field}.linksList`, parseLinkItem),
    image: asOptionalString(value.image, `${field}.image`),
    iframe: asOptionalString(value.iframe, `${field}.iframe`),
    coverImg: asOptionalString(value.coverImg, `${field}.coverImg`),
    download: value.download === undefined ? undefined : Boolean(value.download),
    downloadLink: asOptionalString(value.downloadLink, `${field}.downloadLink`),
    mgContent: asOptionalString(value.mgContent, `${field}.mgContent`),
    mgCode: asOptionalString(value.mgCode, `${field}.mgCode`),
    mgLogo: asOptionalString(value.mgLogo, `${field}.mgLogo`),
    mgTitle: asOptionalString(value.mgTitle, `${field}.mgTitle`),
    mgUrl: asOptionalString(value.mgUrl, `${field}.mgUrl`),
    mgUrlTitle: asOptionalString(value.mgUrlTitle, `${field}.mgUrlTitle`),
    mgLinksList: parseArray(value.mgLinksList, `${field}.mgLinksList`, parseLinkItem),
    mgIconList: parseArray(value.mgIconList, `${field}.mgIconList`, parseIconItem),
    mgListItems: parseArray(value.mgListItems, `${field}.mgListItems`, parseListItem),
    mgListType: (mgListType as 'bullet' | 'numbered' | undefined) ?? undefined,
    mgIconListSpace: value.mgIconListSpace === undefined ? undefined : Boolean(value.mgIconListSpace),
    mgIconListSeparator: value.mgIconListSeparator === undefined ? undefined : Boolean(value.mgIconListSeparator)
  };
}

function parseMetadata(value: unknown, field: string) {
  if (!isRecord(value)) return {title: null, icon: null, color: null};
  return {
    title: asOptionalString(value.title, `${field}.title`),
    icon: asOptionalString(value.icon, `${field}.icon`),
    color: asOptionalThemeColor(value.color, `${field}.color`)
  };
}

function buildDeckIndexItem(path: string, deck: SubjectDeck, field: string): IndexItem {
  const slides = parseArray(deck.slides, `${field}.slides`, parseSlideDocument) ?? [];
  const firstSlide = slides[0];

  return {
    title: deck.title ? asString(deck.title, `${field}.title`) : firstSlide?.title || normalizePath(path).split('/').pop() || 'Deck',
    href: normalizePath(path),
    color: asThemeColorWithDefault(firstSlide?.color ?? null, `${field}.slides[0].color`),
    icon: firstSlide?.icon ?? null,
    description: firstSlide?.description ?? null,
    target: null
  };
}

function createIndexDocument(path: string, title: string, subtitle: string | null, icon: string | null, color: ThemeColor | null, items: IndexItem[]): IndexDocument {
  return {
    kind: 'index',
    path: normalizePath(path),
    meta: {title, subtitle, icon, color},
    items
  };
}

function createDeckDocument(path: string, deck: SubjectDeck, field: string): DeckDocument {
  const slides = parseArray(deck.slides, `${field}.slides`, parseSlideDocument) ?? [];
  if (!slides.length) {
    throw new Error(`El deck ${field} debe tener al menos una slide.`);
  }

  return {
    kind: 'deck',
    path: normalizePath(path),
    slides
  };
}

function addSectionDocuments(map: DocumentMap, section: SubjectSection, parentPath: string, field: string) {
  const slug = normalizePath(asString(section.slug, `${field}.slug`));
  const path = normalizePath([parentPath, slug].filter(Boolean).join('/'));
  const metadata = parseMetadata(section.metadata, `${field}.metadata`);
  const title = metadata.title || asString(section.title, `${field}.title`);
  const decks = Array.isArray(section.decks) ? section.decks : [];
  const subsections = Array.isArray(section.subsections) ? section.subsections : [];

  const items: IndexItem[] = [];

  for (const subsection of subsections) {
    const subsectionMetadata = parseMetadata(subsection.metadata, `${field}.subsections.metadata`);
    const subsectionSlug = normalizePath(asString(subsection.slug, `${field}.subsections.slug`));
    const subsectionPath = normalizePath([path, subsectionSlug].filter(Boolean).join('/'));

    items.push({
      title: subsectionMetadata.title || asString(subsection.title, `${field}.subsections.title`),
      href: subsectionPath,
      color: subsectionMetadata.color ?? 'black',
      icon: subsectionMetadata.icon,
      description: null,
      target: null
    });
  }

  for (let index = 0; index < decks.length; index += 1) {
    const deck = decks[index];
    const deckSlug = normalizePath(asString(deck.slug, `${field}.decks[${index}].slug`));
    const deckPath = normalizePath([path, deckSlug].filter(Boolean).join('/'));
    items.push(buildDeckIndexItem(deckPath, deck, `${field}.decks[${index}]`));
    map.set(deckPath, createDeckDocument(deckPath, deck, `${field}.decks[${index}]`));
  }

  map.set(path, createIndexDocument(path, title, null, metadata.icon, metadata.color, items));

  for (let index = 0; index < subsections.length; index += 1) {
    addSectionDocuments(map, subsections[index], path, `${field}.subsections[${index}]`);
  }
}

export function buildDocumentsFromPublishedContent(input: unknown): {versionId?: string; documents: DocumentMap} {
  if (!isRecord(input)) {
    throw new Error('El contenido publicado debe ser un objeto.');
  }

  const subjects = Array.isArray(input.subjects) ? (input.subjects as SubjectNode[]) : null;
  if (!subjects?.length) {
    throw new Error('El document publicado no contiene subjects.');
  }

  const documents: DocumentMap = new Map();
  const rootItems: IndexItem[] = [];

  for (let subjectIndex = 0; subjectIndex < subjects.length; subjectIndex += 1) {
    const subject = subjects[subjectIndex];
    const subjectSlug = normalizePath(asString(subject.slug, `subjects[${subjectIndex}].slug`));
    const subjectMetadata = parseMetadata(subject.metadata, `subjects[${subjectIndex}].metadata`);
    const subjectTitle = subjectMetadata.title || asString(subject.title, `subjects[${subjectIndex}].title`);
    const subjectSubtitle = asOptionalString(subject.subtitle, `subjects[${subjectIndex}].subtitle`);
    const sections = Array.isArray(subject.sections) ? subject.sections : [];

    rootItems.push({
      title: subjectTitle,
      href: subjectSlug,
      color: subjectMetadata.color ?? 'black',
      icon: subjectMetadata.icon,
      description: subjectSubtitle,
      target: null
    });

    const sectionItems: IndexItem[] = [];

    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
      const section = sections[sectionIndex];
      const sectionMetadata = parseMetadata(section.metadata, `subjects[${subjectIndex}].sections[${sectionIndex}].metadata`);
      const sectionSlug = normalizePath(asString(section.slug, `subjects[${subjectIndex}].sections[${sectionIndex}].slug`));
      const sectionPath = normalizePath([subjectSlug, sectionSlug].join('/'));
      const sectionTitle = sectionMetadata.title || asString(section.title, `subjects[${subjectIndex}].sections[${sectionIndex}].title`);

      sectionItems.push({
        title: sectionTitle,
        href: sectionPath,
        color: sectionMetadata.color ?? 'black',
        icon: sectionMetadata.icon,
        description: null,
        target: null
      });

      addSectionDocuments(documents, section, subjectSlug, `subjects[${subjectIndex}].sections[${sectionIndex}]`);
    }

    documents.set(
      subjectSlug,
      createIndexDocument(subjectSlug, subjectTitle, subjectSubtitle, subjectMetadata.icon, subjectMetadata.color, sectionItems)
    );
  }

  documents.set('', createIndexDocument('', 'Diapositivas v2', 'Contenido cargado desde Supabase.', null, 'black', rootItems));

  return {
    versionId: asOptionalString(input.updatedAt, 'document.updatedAt') ?? undefined,
    documents
  };
}

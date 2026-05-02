/**
 * Content registry.
 *
 * Flattens either the legacy hierarchical `subjects → sections → decks`
 * payload or the static Studio-published runtime bundle into a
 * `Map<path, IndexDocument | DeckDocument>` keyed by canonical path.
 *
 * This module is intentionally thin: parsing lives in `schema/parse.ts`
 * (runtime validation) and `navigation.ts` (IndexItem construction). The
 * goal is that this file only maps the tree to a path-indexed store.
 */

import type {AppDocument, DeckDocument, IndexDocument, IndexItem, RuntimeBundle, SlideDocument, ThemeColor} from './types';
import {
  asOptionalString,
  asString,
  asThemeColorWithDefault,
  isRecord,
  parseArray,
  parseMetadata,
  parseSlideDocument
} from './schema/parse';
import {
  buildDeckIndexItem,
  buildSubsectionIndexItem,
  normalizePath,
  resolveParentPath,
  type SubjectSectionInput
} from './navigation';
import {strings} from './i18n';

export {normalizePath, resolveParentPath};

export type DocumentMap = Map<string, AppDocument>;

interface SubjectNode {
  id?: string;
  slug?: string;
  title?: string;
  subtitle?: string;
  metadata?: Record<string, unknown> | null;
  sections?: SubjectSection[];
}

interface SubjectSection extends SubjectSectionInput {
  decks?: SubjectDeck[];
  subsections?: SubjectSection[];
}

interface SubjectDeck {
  id?: string;
  slug?: string;
  title?: string;
  slides?: unknown[];
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

function createIndexDocument(
  path: string,
  title: string,
  subtitle: string | null,
  icon: string | null,
  color: ThemeColor | null,
  items: IndexItem[]
): IndexDocument {
  return {
    kind: 'index',
    path: normalizePath(path),
    meta: {title, subtitle, icon, color},
    items
  };
}

function createDeckDocument(path: string, deck: SubjectDeck, field: string): DeckDocument {
  const slides = parseArray(deck.slides, `${field}.slides`, parseSlideDocument) as SlideDocument[] | undefined ?? [];
  if (!slides.length) {
    throw new Error(`El deck ${field} debe tener al menos una slide.`);
  }

  return {
    kind: 'deck',
    path: normalizePath(path),
    slides
  };
}

function isExternalHref(value: string) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value.trim());
}

function parseRuntimeIndexItem(value: unknown, field: string): IndexItem {
  if (!isRecord(value)) {
    throw new Error(`El item ${field} debe ser un objeto.`);
  }

  const href = asString(value.href, `${field}.href`);

  return {
    title: asString(value.title, `${field}.title`),
    href: isExternalHref(href) ? href.trim() : normalizePath(href),
    color: asThemeColorWithDefault(value.color, `${field}.color`),
    icon: asOptionalString(value.icon, `${field}.icon`),
    target: asOptionalString(value.target, `${field}.target`),
    disabled: value.disabled === undefined || value.disabled === null ? null : Boolean(value.disabled),
    description: asOptionalString(value.description, `${field}.description`)
  };
}

function parseRuntimeIndexDocument(path: string, raw: Record<string, unknown>, field: string): IndexDocument {
  const metadata = parseMetadata(raw.meta, `${field}.meta`);
  const metaRecord = isRecord(raw.meta) ? raw.meta : {};

  return {
    kind: 'index',
    path,
    meta: {
      title: metadata.title || asString(metaRecord.title, `${field}.meta.title`),
      subtitle: asOptionalString(metaRecord.subtitle, `${field}.meta.subtitle`),
      icon: metadata.icon,
      color: metadata.color
    },
    items: parseArray(raw.items, `${field}.items`, parseRuntimeIndexItem) ?? []
  };
}

function parseRuntimeDeckDocument(path: string, raw: Record<string, unknown>, field: string): DeckDocument {
  const slides = parseArray(raw.slides, `${field}.slides`, parseSlideDocument) ?? [];
  if (!slides.length) {
    throw new Error(`El deck ${field} debe tener al menos una slide.`);
  }

  return {
    kind: 'deck',
    path,
    slides
  };
}

export function buildDocumentsFromRuntimeBundle(input: unknown): {documents: DocumentMap; versionId: string} {
  if (!isRecord(input)) {
    throw new Error('El runtime estático debe ser un objeto.');
  }

  const versionId = asString(input.versionId, 'runtime.versionId');
  if (!isRecord(input.documents)) {
    throw new Error('El runtime estático debe incluir un mapa documents.');
  }

  const bundle = input as unknown as RuntimeBundle;
  const documents: DocumentMap = new Map();

  for (const [rawPath, rawDocument] of Object.entries(bundle.documents)) {
    const path = normalizePath(rawPath);
    const field = `runtime.documents[${JSON.stringify(rawPath)}]`;
    if (!isRecord(rawDocument)) {
      throw new Error(`El documento ${field} debe ser un objeto.`);
    }

    if (rawDocument.kind === 'index') {
      documents.set(path, parseRuntimeIndexDocument(path, rawDocument, field));
      continue;
    }

    if (rawDocument.kind === 'deck') {
      documents.set(path, parseRuntimeDeckDocument(path, rawDocument, field));
      continue;
    }

    throw new Error(`El documento ${field}.kind no es válido.`);
  }

  if (!documents.has('')) {
    throw new Error('El runtime estático no contiene el índice raíz.');
  }

  return {documents, versionId};
}

function addSectionDocuments(map: DocumentMap, section: SubjectSection, parentPath: string, field: string) {
  const slug = normalizePath(asString(section.slug, `${field}.slug`));
  const path = normalizePath([parentPath, slug].filter(Boolean).join('/'));
  const metadata = parseMetadata(section.metadata, `${field}.metadata`);
  const title = metadata.title || asString(section.title, `${field}.title`);
  const decks = Array.isArray(section.decks) ? section.decks : [];
  const subsections = Array.isArray(section.subsections) ? section.subsections : [];

  const items: IndexItem[] = [];

  for (let index = 0; index < subsections.length; index += 1) {
    const subsection = subsections[index];
    const subsectionSlug = normalizePath(asString(subsection.slug, `${field}.subsections[${index}].slug`));
    const subsectionPath = normalizePath([path, subsectionSlug].filter(Boolean).join('/'));
    items.push(buildSubsectionIndexItem(subsectionPath, subsection, `${field}.subsections[${index}]`));
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

export function buildDocumentsFromPublishedContent(input: unknown): {documents: DocumentMap} {
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
    const subjectSubtitle = subject.subtitle
      ? asString(subject.subtitle, `subjects[${subjectIndex}].subtitle`, {allowEmpty: true})
      : null;
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

  documents.set(
    '',
    createIndexDocument('', strings.app.rootTitle, strings.app.rootSubtitle, null, 'black', rootItems)
  );

  return {documents};
}

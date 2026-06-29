/**
 * Runtime validators for published content payloads.
 *
 * These helpers are intentionally tiny wrappers around `typeof` + coercion:
 * they only live here because every callsite in `content-registry` used to
 * reinvent them inline. Keeping validation isolated from the mapping layer
 * makes it easier to swap the whole module for Zod/Valibot later without
 * touching the domain code.
 */

import type {IconItem, LinkItem, ListItem, MagicBoxData, SlideDocument, SlideTemplate, ThemeColor, TimelineSegment} from '../types';

export const THEME_COLORS = new Set<ThemeColor>(['red', 'blue', 'yellow', 'black']);
export const SLIDE_TEMPLATES = new Set<SlideTemplate>(['cover', 'about', 'card', 'image', 'text', 'timeline']);
export const MAGIC_LIST_TYPES = new Set<'bullet' | 'numbered'>(['bullet', 'numbered']);

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function asString(value: unknown, field: string, {allowEmpty = false}: {allowEmpty?: boolean} = {}) {
  if (typeof value !== 'string') {
    throw new Error(`El campo ${field} debe ser string.`);
  }

  const normalized = value.trim();
  if (!allowEmpty && !normalized) {
    throw new Error(`El campo ${field} no puede estar vacío.`);
  }

  return normalized;
}

export function asOptionalString(value: unknown, field: string) {
  if (value === undefined || value === null) return null;
  return asString(value, field, {allowEmpty: true});
}

export function asOptionalBoolean(value: unknown, field: string) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'boolean') {
    throw new Error(`El campo ${field} debe ser boolean.`);
  }
  return value;
}

export function asOptionalThemeColor(value: unknown, field: string): ThemeColor | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'string' && THEME_COLORS.has(value as ThemeColor)) {
    return value as ThemeColor;
  }
  throw new Error(`El campo ${field} debe ser uno de: ${[...THEME_COLORS].join(', ')}.`);
}

export function asThemeColorWithDefault(value: unknown, field: string): ThemeColor {
  return asOptionalThemeColor(value, field) ?? 'black';
}

export function asOptionalNumberOrString(value: unknown, field: string) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number' || typeof value === 'string') return value;
  throw new Error(`El campo ${field} debe ser string o number.`);
}

export function parseArray<T>(
  value: unknown,
  field: string,
  parseItem: (value: unknown, field: string) => T
): T[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    throw new Error(`El campo ${field} debe ser un array.`);
  }
  return value.map((item, index) => parseItem(item, `${field}[${index}]`));
}

export function parseLinkItem(value: unknown, field: string): LinkItem {
  if (!isRecord(value)) throw new Error(`El elemento ${field} debe ser un objeto.`);
  return {
    title: asOptionalString(value.title, `${field}.title`),
    link: asOptionalString(value.link, `${field}.link`)
  };
}

export function parseIconItem(value: unknown, field: string): IconItem {
  if (!isRecord(value)) throw new Error(`El elemento ${field} debe ser un objeto.`);
  return {
    icon: asOptionalString(value.icon, `${field}.icon`)
  };
}

export function parseListItem(value: unknown, field: string): ListItem {
  if (!isRecord(value)) throw new Error(`El elemento ${field} debe ser un objeto.`);
  return {
    num: asOptionalString(value.num, `${field}.num`),
    title: asOptionalString(value.title, `${field}.title`),
    description: asOptionalString(value.description, `${field}.description`)
  };
}

export function asOptionalNumber(value: unknown, field: string): number | null {
  if (value === undefined || value === null || value === '') return null;
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) {
    throw new Error(`El campo ${field} debe ser un número.`);
  }
  return num;
}

export function parseTimelineSegment(value: unknown, field: string): TimelineSegment {
  if (!isRecord(value)) throw new Error(`El elemento ${field} debe ser un objeto.`);
  return {
    label: asOptionalString(value.label, `${field}.label`),
    caption: asOptionalString(value.caption, `${field}.caption`),
    meta: asOptionalString(value.meta, `${field}.meta`),
    icon: asOptionalString(value.icon, `${field}.icon`),
    color: asOptionalThemeColor(value.color, `${field}.color`),
    span: asOptionalNumber(value.span, `${field}.span`)
  };
}

export function parseMetadata(value: unknown, field: string) {
  if (!isRecord(value)) return {title: null, icon: null, color: null};
  return {
    title: asOptionalString(value.title, `${field}.title`),
    icon: asOptionalString(value.icon, `${field}.icon`),
    color: asOptionalThemeColor(value.color, `${field}.color`)
  };
}

function parseMagicListType(value: unknown, field: string): 'bullet' | 'numbered' | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string' || !MAGIC_LIST_TYPES.has(value as 'bullet' | 'numbered')) {
    throw new Error(`El campo ${field} debe ser 'bullet' o 'numbered'.`);
  }
  return value as 'bullet' | 'numbered';
}

function parseMagicBoxFromObject(value: unknown, field: string): MagicBoxData | null {
  if (value === undefined || value === null) return null;
  if (!isRecord(value)) throw new Error(`El campo ${field} debe ser un objeto.`);

  return {
    title: asOptionalString(value.title, `${field}.title`),
    content: asOptionalString(value.content, `${field}.content`),
    code: asOptionalString(value.code, `${field}.code`),
    logo: asOptionalString(value.logo, `${field}.logo`),
    url: asOptionalString(value.url, `${field}.url`),
    urlTitle: asOptionalString(value.urlTitle, `${field}.urlTitle`),
    linksList: parseArray(value.linksList, `${field}.linksList`, parseLinkItem),
    iconList: parseArray(value.iconList, `${field}.iconList`, parseIconItem),
    listItems: parseArray(value.listItems, `${field}.listItems`, parseListItem),
    listType: parseMagicListType(value.listType, `${field}.listType`),
    iconListSpace: value.iconListSpace === undefined ? undefined : Boolean(value.iconListSpace),
    iconListSeparator: value.iconListSeparator === undefined ? undefined : Boolean(value.iconListSeparator)
  };
}

function parseMagicBoxFromLegacy(value: Record<string, unknown>, field: string): MagicBoxData {
  return {
    title: asOptionalString(value.mgTitle, `${field}.mgTitle`),
    content: asOptionalString(value.mgContent, `${field}.mgContent`),
    code: asOptionalString(value.mgCode, `${field}.mgCode`),
    logo: asOptionalString(value.mgLogo, `${field}.mgLogo`),
    url: asOptionalString(value.mgUrl, `${field}.mgUrl`),
    urlTitle: asOptionalString(value.mgUrlTitle, `${field}.mgUrlTitle`),
    linksList: parseArray(value.mgLinksList, `${field}.mgLinksList`, parseLinkItem),
    iconList: parseArray(value.mgIconList, `${field}.mgIconList`, parseIconItem),
    listItems: parseArray(value.mgListItems, `${field}.mgListItems`, parseListItem),
    listType: parseMagicListType(value.mgListType, `${field}.mgListType`),
    iconListSpace: value.mgIconListSpace === undefined ? undefined : Boolean(value.mgIconListSpace),
    iconListSeparator: value.mgIconListSeparator === undefined ? undefined : Boolean(value.mgIconListSeparator)
  };
}

function magicBoxIsEmpty(data: MagicBoxData) {
  return (
    !data.title &&
    !data.content &&
    !data.code &&
    !data.logo &&
    !data.url &&
    !data.urlTitle &&
    !data.linksList?.length &&
    !data.iconList?.length &&
    !data.listItems?.length
  );
}

export function parseSlideDocument(value: unknown, field: string): SlideDocument {
  if (!isRecord(value)) throw new Error(`La slide ${field} debe ser un objeto.`);

  const template = asString(value.template, `${field}.template`);
  if (!SLIDE_TEMPLATES.has(template as SlideTemplate)) {
    throw new Error(`La slide ${field}.template no es válida.`);
  }

  // Accept both the new `magicBox` subobject and the legacy `mg*` fields.
  // Explicit subobject wins, so studios can migrate gradually.
  const magicBoxExplicit = parseMagicBoxFromObject(value.magicBox, `${field}.magicBox`);
  const magicBoxLegacy = parseMagicBoxFromLegacy(value, field);
  const magicBox = magicBoxExplicit ?? (magicBoxIsEmpty(magicBoxLegacy) ? undefined : magicBoxLegacy);
  const legacyMagicBoxFields = {
    mgTitle: asOptionalString(value.mgTitle, `${field}.mgTitle`),
    mgContent: asOptionalString(value.mgContent, `${field}.mgContent`),
    mgCode: asOptionalString(value.mgCode, `${field}.mgCode`),
    mgLogo: asOptionalString(value.mgLogo, `${field}.mgLogo`),
    mgUrl: asOptionalString(value.mgUrl, `${field}.mgUrl`),
    mgUrlTitle: asOptionalString(value.mgUrlTitle, `${field}.mgUrlTitle`),
    mgLinksList: parseArray(value.mgLinksList, `${field}.mgLinksList`, parseLinkItem),
    mgIconList: parseArray(value.mgIconList, `${field}.mgIconList`, parseIconItem),
    mgListItems: parseArray(value.mgListItems, `${field}.mgListItems`, parseListItem),
    mgListType: parseMagicListType(value.mgListType, `${field}.mgListType`),
    mgIconListSpace: value.mgIconListSpace === undefined ? undefined : Boolean(value.mgIconListSpace),
    mgIconListSeparator: value.mgIconListSeparator === undefined ? undefined : Boolean(value.mgIconListSeparator)
  };

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
    timeline: parseArray(value.timeline, `${field}.timeline`, parseTimelineSegment),
    image: asOptionalString(value.image, `${field}.image`),
    iframe: asOptionalString(value.iframe, `${field}.iframe`),
    coverImg: asOptionalString(value.coverImg, `${field}.coverImg`),
    download: value.download === undefined ? undefined : Boolean(value.download),
    downloadLink: asOptionalString(value.downloadLink, `${field}.downloadLink`),
    magicBox,
    ...legacyMagicBoxFields
  };
}

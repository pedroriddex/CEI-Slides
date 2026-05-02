import type {
  ContentPhase,
  Direction,
  IconItem,
  LinkItem,
  ListItem,
  PhasedItem,
  SlideDocument,
  SlideTransitionMode
} from './types.ts';
import {getMagicBox} from './content-helpers.ts';

export interface SlideTransitionDecision {
  mode: SlideTransitionMode;
  sharedGroups: string[];
}

function normalizeValue(value: unknown): unknown {
  if (value === undefined || value === null) return null;

  if (typeof value === 'string') {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce<Record<string, unknown>>((acc, [key, entry]) => {
        acc[key] = normalizeValue(entry);
        return acc;
      }, {});
  }

  return value;
}

function serializeValue(value: unknown) {
  return JSON.stringify(normalizeValue(value));
}

function isSameNormalized(a: unknown, b: unknown) {
  return serializeValue(a) === serializeValue(b);
}

function isMeaningfulNormalized(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.length > 0;
  if (typeof value === 'number') return true;
  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.some((item) => isMeaningfulNormalized(item));
  if (typeof value === 'object') return Object.values(value as Record<string, unknown>).some((entry) => isMeaningfulNormalized(entry));
  return true;
}

function hasMeaningfulValue(value: unknown) {
  return isMeaningfulNormalized(normalizeValue(value));
}

function sharedGroup(name: string, left: unknown, right: unknown) {
  if (!hasMeaningfulValue(left) || !hasMeaningfulValue(right)) return null;
  return isSameNormalized(left, right) ? name : null;
}

function magicMetaGroup(slide: SlideDocument | null) {
  const mb = slide ? getMagicBox(slide) : null;
  return {
    title: mb?.title || '',
    content: mb?.content || '',
    code: mb?.code || '',
    logo: mb?.logo || '',
    url: mb?.url || '',
    urlTitle: mb?.urlTitle || ''
  };
}

function mediaGroup(slide: SlideDocument | null) {
  return {
    image: slide?.image || '',
    iframe: slide?.iframe || '',
    coverImg: slide?.coverImg || ''
  };
}

function magicIconsGroup(slide: SlideDocument | null) {
  const mb = slide ? getMagicBox(slide) : null;
  const icons = mb?.iconList || [];
  return {
    icons,
    spaced: icons.length ? Boolean(mb?.iconListSpace) : null,
    separator: icons.length ? Boolean(mb?.iconListSeparator) : null
  };
}

function magicListGroup(slide: SlideDocument | null) {
  const mb = slide ? getMagicBox(slide) : null;
  const items = mb?.listItems || [];
  return {
    items,
    type: items.length ? mb?.listType || 'bullet' : null
  };
}

export function resolveSelectivePhase(phase: ContentPhase, currentValue: unknown, comparisonValue: unknown): ContentPhase {
  if (phase === 'idle') return 'idle';
  return serializeValue(currentValue) !== serializeValue(comparisonValue) ? phase : 'idle';
}

function buildBuckets<T>(items: T[], keyFor: (item: T) => string) {
  const buckets = new Map<string, number>();
  for (const item of items) {
    const key = keyFor(item);
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  return buckets;
}

export function createPhasedItems<T>(
  phase: ContentPhase,
  currentItems: T[],
  comparisonItems: T[],
  keyFor: (item: T) => string
): PhasedItem<T>[] {
  if (phase === 'idle') {
    return currentItems.map((item) => ({key: keyFor(item), item, phase: 'idle'}));
  }

  const buckets = buildBuckets(comparisonItems, keyFor);

  return currentItems.map((item) => {
    const key = keyFor(item);
    const count = buckets.get(key) || 0;
    if (count > 0) {
      buckets.set(key, count - 1);
      return {key, item, phase: 'idle'};
    }

    return {key, item, phase};
  });
}

export function listItemKey(item: ListItem) {
  return serializeValue({
    num: item.num || null,
    title: item.title || null,
    description: item.description || null
  });
}

export function bulletListItemKey(item: ListItem) {
  return serializeValue({
    title: item.title || null,
    description: item.description || null
  });
}

export function linkItemKey(item: LinkItem) {
  return serializeValue({
    title: item.title || null,
    link: item.link || null
  });
}

export function iconItemKey(item: IconItem) {
  return serializeValue({icon: item.icon || null});
}

export function hasSameLayout(a: SlideDocument | null, b: SlideDocument | null) {
  if (!a || !b) return false;
  return a.template === b.template && Boolean(a.sideblockopen) === Boolean(b.sideblockopen);
}

export function getSharedSemanticGroups(a: SlideDocument | null, b: SlideDocument | null) {
  if (!a || !b) return [];

  const magicBoxA = getMagicBox(a);
  const magicBoxB = getMagicBox(b);

  return [
    sharedGroup('title', a.title || '', b.title || ''),
    sharedGroup('description', a.description || '', b.description || ''),
    sharedGroup('postDescription', a.postDescription || '', b.postDescription || ''),
    sharedGroup('media', mediaGroup(a), mediaGroup(b)),
    sharedGroup('listItems', a.listItems || [], b.listItems || []),
    sharedGroup('list', a.list || [], b.list || []),
    sharedGroup('linksList', a.linksList || [], b.linksList || []),
    sharedGroup('magicMeta', magicMetaGroup(a), magicMetaGroup(b)),
    sharedGroup('magicLinks', magicBoxA.linksList || [], magicBoxB.linksList || []),
    sharedGroup('magicIcons', magicIconsGroup(a), magicIconsGroup(b)),
    sharedGroup('magicList', magicListGroup(a), magicListGroup(b))
  ].filter((value): value is string => Boolean(value));
}

export function hasMeaningfulSharedContent(a: SlideDocument | null, b: SlideDocument | null) {
  return getSharedSemanticGroups(a, b).length > 0;
}

export function resolveSlideTransitionMode(a: SlideDocument | null, b: SlideDocument | null): SlideTransitionDecision {
  if (!hasSameLayout(a, b)) {
    return {
      mode: 'whole-layout',
      sharedGroups: []
    };
  }

  const sharedGroups = getSharedSemanticGroups(a, b);
  return {
    mode: sharedGroups.length > 0 ? 'selective' : 'whole-same-layout',
    sharedGroups
  };
}

export function shouldUseSelectiveBodyTransition(a: SlideDocument | null, b: SlideDocument | null) {
  return resolveSlideTransitionMode(a, b).mode === 'selective';
}

export function directionAwarePhase(phase: ContentPhase, direction: Direction) {
  if (phase === 'idle') return 'idle';
  return `${phase}-${direction}`;
}

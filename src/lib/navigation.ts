/**
 * Navigation helpers: turn the published content tree into the flat list of
 * `IndexItem`s that a `content-index` renders, and expose small path helpers
 * shared across the app.
 */

import type {IndexItem, SlideDocument, ThemeColor} from './types';
import {parseSlideDocument, asString, parseArray, asThemeColorWithDefault, parseMetadata} from './schema/parse';
import {strings} from './i18n';

export function normalizePath(value = '') {
  return value.replace(/^\/+|\/+$/g, '').trim();
}

export function resolveParentPath(path = '') {
  const normalized = normalizePath(path);
  if (!normalized) return '';
  const parts = normalized.split('/');
  parts.pop();
  return parts.join('/');
}

export interface SubjectDeckInput {
  slug?: unknown;
  title?: unknown;
  slides?: unknown;
}

export interface SubjectSectionInput {
  slug?: unknown;
  title?: unknown;
  metadata?: unknown;
}

/**
 * Builds the `IndexItem` that represents a deck in its parent's index page.
 * Uses the first slide to derive a sensible default title/color/icon when
 * the deck itself does not define them.
 */
export function buildDeckIndexItem(path: string, deck: SubjectDeckInput, field: string): IndexItem {
  const slides: SlideDocument[] = parseArray(deck.slides, `${field}.slides`, parseSlideDocument) ?? [];
  const firstSlide = slides[0];

  return {
    title: deck.title
      ? asString(deck.title, `${field}.title`)
      : firstSlide?.title || normalizePath(path).split('/').pop() || strings.slides.deckFallbackTitle,
    href: normalizePath(path),
    color: asThemeColorWithDefault(firstSlide?.color ?? null, `${field}.slides[0].color`),
    icon: firstSlide?.icon ?? null,
    description: firstSlide?.description ?? null,
    target: null
  };
}

export function buildSubsectionIndexItem(
  path: string,
  subsection: SubjectSectionInput,
  field: string
): IndexItem {
  const metadata = parseMetadata(subsection.metadata, `${field}.metadata`);
  const title = metadata.title || asString(subsection.title, `${field}.title`);
  const color: ThemeColor = metadata.color ?? 'black';

  return {
    title,
    href: normalizePath(path),
    color,
    icon: metadata.icon,
    description: null,
    target: null
  };
}

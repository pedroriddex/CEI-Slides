/**
 * Asset & URL helpers shared by slide templates and blocks.
 *
 * Beyond the simple path-building helpers, `normalizeUrl` also enforces
 * a scheme allowlist so that published content cannot inject
 * `javascript:` / `data:` / `vbscript:` URLs into our <a href>, <img src>,
 * <iframe src>, etc. Anything unsafe is rejected and returned as empty
 * string — callers already treat empty strings as "nothing to render".
 */

import {devWarn} from './dev-log';

const SAFE_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:'] as const;

function isExternalAsset(value: string) {
  return /^(https?:)?\/\//.test(value) || value.startsWith('/');
}

function isSafeRelative(value: string) {
  // Accept plain paths, query strings and hash fragments.
  return (
    value.startsWith('/') ||
    value.startsWith('./') ||
    value.startsWith('../') ||
    value.startsWith('#') ||
    value.startsWith('?')
  );
}

function isSafeScheme(value: string) {
  const match = value.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (!match) return false;
  const scheme = match[1].toLowerCase() + ':';
  return (SAFE_SCHEMES as readonly string[]).includes(scheme);
}

export function isSafeUrl(value: string) {
  if (!value) return false;
  if (value.startsWith('//')) return true; // protocol-relative
  if (isSafeRelative(value)) return true;
  return isSafeScheme(value);
}

/**
 * Trims and validates a URL-ish value. Returns '' when:
 *   - the input is empty / nullish,
 *   - the scheme is not in the allowlist (http, https, mailto, tel),
 *   - the value contains control characters.
 */
export function normalizeUrl(value?: string | null) {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return '';
  // Reject control characters / newlines that could smuggle a second URL.
  if (/[\u0000-\u001f\u007f]/.test(trimmed)) return '';
  return isSafeUrl(trimmed) ? trimmed : '';
}

/**
 * Escapes a URL so it can be safely interpolated inside a CSS `url("...")`
 * value. Removes quotes, parentheses and backslashes (they could terminate
 * the declaration and inject further properties).
 */
export function cssUrlValue(value?: string | null) {
  const safe = normalizeUrl(value);
  if (!safe) return '';
  const escaped = safe.replace(/["'()\\]/g, '');
  return `url("${escaped}")`;
}

function warnMissingSlug(kind: string, name: string) {
  devWarn('assets', `${kind}: received name="${name}" but slug is empty — asset path will be unresolved.`);
}

export function resolveAssetPath(slug?: string | null, name?: string | null) {
  if (!name) return '';
  if (isExternalAsset(name)) return name;
  if (!slug) {
    warnMissingSlug('resolveAssetPath', name);
    return '';
  }
  const fileName = /\.[a-zA-Z0-9]+$/.test(name) ? name : `${name}.webp`;
  return `/media/${slug}/${fileName}`;
}

export function resolveSvgAssetPath(slug?: string | null, name?: string | null) {
  if (!name) return '';
  if (isExternalAsset(name)) return name;
  if (!slug) {
    warnMissingSlug('resolveSvgAssetPath', name);
    return '';
  }
  const fileName = /\.[a-zA-Z0-9]+$/.test(name) ? name : `${name}.svg`;
  return `/media/${slug}/${fileName}`;
}

export function resolveIframePath(slug?: string | null, iframe?: string | null) {
  if (!iframe) return '';
  if (isExternalAsset(iframe)) return iframe;
  if (!slug) {
    warnMissingSlug('resolveIframePath', iframe);
    return '';
  }
  return `/media/${slug}/${iframe}/index.html`;
}

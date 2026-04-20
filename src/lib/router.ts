import {normalizePath} from './content-registry';

export interface AppRouteState {
  path: string;
  slide: number;
}

export function readRoute(): AppRouteState {
  const url = new URL(window.location.href);
  const path = normalizePath(url.searchParams.get('path') || '');
  const slideParam = Number.parseInt(url.searchParams.get('slide') || '0', 10);
  return {
    path,
    slide: Number.isFinite(slideParam) ? Math.max(0, slideParam) : 0
  };
}

export function writeRoute(next: Partial<AppRouteState>, options?: {replace?: boolean}) {
  const current = readRoute();
  const merged = {
    path: next.path !== undefined ? normalizePath(next.path) : current.path,
    slide: next.slide !== undefined ? Math.max(0, Math.trunc(next.slide)) : current.slide
  };

  const url = new URL(window.location.href);
  if (merged.path) url.searchParams.set('path', merged.path);
  else url.searchParams.delete('path');

  if (merged.slide > 0) url.searchParams.set('slide', String(merged.slide));
  else url.searchParams.delete('slide');

  const method = options?.replace ? 'replaceState' : 'pushState';
  window.history[method]({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

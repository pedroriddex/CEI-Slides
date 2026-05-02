/**
 * Minimal query-string router used by `<app-root>`.
 *
 * Exposes `readRoute` / `writeRoute` for imperative navigation, and an
 * `appRouter` EventTarget that emits a `route-change` CustomEvent whenever
 * either an explicit writeRoute call or a browser `popstate` event changes
 * the URL. Consumers subscribe to a single, well-known channel instead of
 * relying on a synthetic `popstate` dispatch on `window`.
 */

import {normalizePath} from './content-registry';

export interface AppRouteState {
  path: string;
  slide: number;
}

export const ROUTE_CHANGE_EVENT = 'route-change';

type RouteChangeHandler = (event: CustomEvent<AppRouteState>) => void;

class AppRouter extends EventTarget {
  private popstateBound = false;

  emit(state: AppRouteState) {
    this.dispatchEvent(new CustomEvent<AppRouteState>(ROUTE_CHANGE_EVENT, {detail: state}));
  }

  subscribe(listener: RouteChangeHandler) {
    this.ensurePopstateBridge();
    this.addEventListener(ROUTE_CHANGE_EVENT, listener as EventListener);
    return () => this.unsubscribe(listener);
  }

  unsubscribe(listener: RouteChangeHandler) {
    this.removeEventListener(ROUTE_CHANGE_EVENT, listener as EventListener);
  }

  private ensurePopstateBridge() {
    if (this.popstateBound || typeof window === 'undefined') return;
    this.popstateBound = true;
    window.addEventListener('popstate', () => this.emit(readRoute()));
  }
}

export const appRouter = new AppRouter();

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
  const merged: AppRouteState = {
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
  appRouter.emit(merged);
}

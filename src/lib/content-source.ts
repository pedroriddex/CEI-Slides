import {buildDocumentsFromRuntimeBundle, type DocumentMap} from './content-registry';
import {devWarn} from './dev-log';

const SESSION_CACHE_KEY = 'v2-static-runtime-cache-v1';
const DEFAULT_RUNTIME_TIMEOUT_MS = 15_000;
const DEFAULT_RUNTIME_URL = '/content/runtime.json';

export interface LoadedContent {
  documents: DocumentMap;
  versionId: string;
  /** Indicates the data came from sessionStorage instead of the network. */
  fromCache?: boolean;
}

export interface LoadContentOptions {
  /** Abort the runtime fetch after this many ms. Defaults to 15 s. */
  timeoutMs?: number;
  /** External abort signal (e.g. to cancel when navigating). */
  signal?: AbortSignal;
}

export type LoadContentErrorKind = 'config' | 'network' | 'timeout' | 'invalid';

export class LoadContentError extends Error {
  constructor(public readonly kind: LoadContentErrorKind, message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'LoadContentError';
  }
}

interface CachedRuntimePayload {
  bundle: unknown;
  versionId: string;
  cachedAt: number;
}

function readRuntimeUrl() {
  const configured = (import.meta.env.VITE_CONTENT_RUNTIME_URL || '').trim();
  return configured || DEFAULT_RUNTIME_URL;
}

function readSessionCache(): CachedRuntimePayload | null {
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRuntimePayload;
    if (!parsed?.versionId || typeof parsed.bundle === 'undefined') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSessionCache(payload: CachedRuntimePayload) {
  try {
    sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Storage full / disabled — fallback caching is best-effort.
  }
}

function clearSessionCache() {
  try {
    sessionStorage.removeItem(SESSION_CACHE_KEY);
  } catch {
    // best-effort
  }
}

function combineSignals(signals: Array<AbortSignal | undefined>): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (!signal) continue;
    if (signal.aborted) {
      controller.abort(signal.reason);
      break;
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), {once: true});
  }
  return controller.signal;
}

async function fetchRuntimeBundle(url: string, signal: AbortSignal) {
  let response: Response;
  try {
    response = await fetch(url, {
      signal,
      headers: {accept: 'application/json'}
    });
  } catch (error) {
    throw error;
  }

  if (!response.ok) {
    throw new LoadContentError('network', `No se pudo cargar el runtime estático (${response.status}).`);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new LoadContentError('invalid', 'El runtime estático no contiene JSON válido.', error);
  }
}

function parseBundle(bundle: unknown) {
  try {
    return buildDocumentsFromRuntimeBundle(bundle);
  } catch (error) {
    throw new LoadContentError('invalid', error instanceof Error ? error.message : String(error), error);
  }
}

export async function loadContent(options: LoadContentOptions = {}): Promise<LoadedContent> {
  const runtimeUrl = readRuntimeUrl();
  const timeoutMs = options.timeoutMs ?? DEFAULT_RUNTIME_TIMEOUT_MS;
  const timeoutSignal = typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
    ? AbortSignal.timeout(timeoutMs)
    : undefined;
  const abortSignal = combineSignals([options.signal, timeoutSignal]);

  try {
    const bundle = await fetchRuntimeBundle(runtimeUrl, abortSignal);
    const normalized = parseBundle(bundle);
    writeSessionCache({bundle, versionId: normalized.versionId, cachedAt: Date.now()});
    return normalized;
  } catch (error) {
    return handleRuntimeFailure(error, runtimeUrl);
  }
}

function handleRuntimeFailure(error: unknown, runtimeUrl: string): LoadedContent {
  if (error instanceof LoadContentError && error.kind === 'invalid') {
    throw error;
  }

  const cached = readSessionCache();
  if (cached) {
    try {
      const {documents, versionId} = buildDocumentsFromRuntimeBundle(cached.bundle);
      devWarn('content-source', `Static runtime ${runtimeUrl} unreachable, using cached runtime.`, error);
      return {documents, versionId: versionId || cached.versionId, fromCache: true};
    } catch {
      clearSessionCache();
    }
  }

  const isTimeout = error instanceof DOMException && error.name === 'TimeoutError';
  const kind: LoadContentErrorKind = isTimeout ? 'timeout' : 'network';
  const message = isTimeout
    ? 'La carga del runtime estático tardó demasiado.'
    : `No se pudo cargar el runtime estático desde ${runtimeUrl}.`;
  throw new LoadContentError(kind, message, error);
}

import {normalizePath} from './content-registry';
import type {DocumentMap} from './content-registry';
import type {DeckDocument, IndexDocument} from './types';

export interface StudioPreviewLivePayload {
  selectionKind: 'index' | 'deck' | null;
  selectionPath: string;
  indexDocument: IndexDocument | null;
  deckDocument: DeckDocument | null;
  currentSlideIndex: number;
  sentAt: number;
}

export function applyStudioPreviewPayload(
  baseDocuments: DocumentMap,
  payload: StudioPreviewLivePayload
): {documents: DocumentMap; slide: number; path: string} {
  const nextDocuments = new Map(baseDocuments);
  const normalizedPath = normalizePath(payload.selectionPath);

  if (payload.selectionKind === 'index' && payload.indexDocument) {
    nextDocuments.set(normalizedPath, payload.indexDocument);
  }

  if (payload.selectionKind === 'deck' && payload.deckDocument) {
    nextDocuments.set(normalizedPath, payload.deckDocument);
  }

  return {
    documents: nextDocuments,
    slide: Math.max(0, payload.currentSlideIndex),
    path: normalizedPath
  };
}

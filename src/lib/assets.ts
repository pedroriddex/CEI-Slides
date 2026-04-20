function isExternalAsset(value: string) {
  return /^(https?:)?\/\//.test(value) || value.startsWith('/');
}

export function normalizeUrl(value?: string | null) {
  return value?.trim() || '';
}

export function resolveAssetPath(slug?: string | null, name?: string | null) {
  if (!name) return '';
  if (isExternalAsset(name)) return name;
  if (!slug) return '';
  const fileName = /\.[a-zA-Z0-9]+$/.test(name) ? name : `${name}.webp`;
  return `/media/${slug}/${fileName}`;
}

export function resolveSvgAssetPath(slug?: string | null, name?: string | null) {
  if (!name) return '';
  if (isExternalAsset(name)) return name;
  if (!slug) return '';
  const fileName = /\.[a-zA-Z0-9]+$/.test(name) ? name : `${name}.svg`;
  return `/media/${slug}/${fileName}`;
}

export function resolveIframePath(slug?: string | null, iframe?: string | null) {
  if (!iframe) return '';
  if (isExternalAsset(iframe)) return iframe;
  if (!slug) return '';
  return `/media/${slug}/${iframe}/index.html`;
}

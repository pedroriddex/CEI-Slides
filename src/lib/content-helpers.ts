import type {IconItem, LinkItem, ListItem, SlideDocument} from './types';

export function hasText(value: string | null | undefined) {
  return Boolean((value || '').trim());
}

export function validLinks(items: LinkItem[] = []) {
  return items.filter((item) => hasText(item.title) || hasText(item.link));
}

export function validIcons(items: IconItem[] = []) {
  return items.filter((item) => hasText(item.icon));
}

export function validNumberedItems(items: ListItem[] = []) {
  return items.filter((item) => hasText(item.title) || hasText(item.description) || hasText(item.num));
}

export function validBulletItems(items: ListItem[] = []) {
  return items.filter((item) => hasText(item.title) || hasText(item.description));
}

export function hasMagicBoxContent(slide: SlideDocument, logoSrc: string | null = null) {
  return Boolean(
    hasText(slide.mgContent) ||
    hasText(slide.mgTitle) ||
    logoSrc ||
    hasText(slide.mgUrlTitle) ||
    hasText(slide.mgUrl) ||
    validLinks(slide.mgLinksList || []).length ||
    validIcons(slide.mgIconList || []).length ||
    validNumberedItems(slide.mgListItems || []).length
  );
}

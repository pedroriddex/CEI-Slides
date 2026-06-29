import type {IconItem, LinkItem, ListItem, MagicBoxData, SlideDocument, TimelineSegment} from './types';

const EMPTY_MAGIC_BOX: MagicBoxData = Object.freeze({}) as MagicBoxData;

function getLegacyMagicBox(slide: SlideDocument): MagicBoxData | null {
  const data: MagicBoxData = {
    title: slide.mgTitle,
    content: slide.mgContent,
    code: slide.mgCode,
    logo: slide.mgLogo,
    url: slide.mgUrl,
    urlTitle: slide.mgUrlTitle,
    linksList: slide.mgLinksList,
    iconList: slide.mgIconList,
    listItems: slide.mgListItems,
    listType: slide.mgListType ?? undefined,
    iconListSpace: slide.mgIconListSpace ?? undefined,
    iconListSeparator: slide.mgIconListSeparator ?? undefined
  };

  const hasContent = Boolean(
    data.title ||
      data.content ||
      data.code ||
      data.logo ||
      data.url ||
      data.urlTitle ||
      data.linksList?.length ||
      data.iconList?.length ||
      data.listItems?.length
  );

  return hasContent ? data : null;
}

/** Returns the magicBox subobject, never null — safe to destructure. */
export function getMagicBox(slide: SlideDocument): MagicBoxData {
  return slide.magicBox ?? getLegacyMagicBox(slide) ?? EMPTY_MAGIC_BOX;
}

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

export function validTimelineSegments(items: TimelineSegment[] = []) {
  return items.filter((item) => hasText(item.label) || hasText(item.caption) || hasText(item.meta) || hasText(item.icon));
}

export function hasMagicBoxContent(slide: SlideDocument, logoSrc: string | null = null) {
  const mb = getMagicBox(slide);
  return Boolean(
    hasText(mb.content) ||
    hasText(mb.title) ||
    logoSrc ||
    hasText(mb.urlTitle) ||
    hasText(mb.url) ||
    validLinks(mb.linksList || []).length ||
    validIcons(mb.iconList || []).length ||
    validNumberedItems(mb.listItems || []).length
  );
}

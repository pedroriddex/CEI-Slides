export type ThemeColor = 'red' | 'blue' | 'yellow' | 'black';
export type SlideTemplate = 'cover' | 'about' | 'card' | 'image' | 'text';
export type NavRowVariant = 'primary' | 'primary-grid' | 'secondary';
export type MagicBoxTone = 'surface' | 'block';
export type Direction = 'forward' | 'backward';
export type ContentPhase = 'idle' | 'out' | 'in';
export type SlideTransitionMode = 'selective' | 'whole-same-layout' | 'whole-layout';

export interface IndexItem {
  title: string;
  color: ThemeColor;
  icon?: string | null;
  href: string;
  target?: string | null;
  disabled?: boolean | null;
  description?: string | null;
}

export interface IndexDocument {
  kind: 'index';
  path: string;
  meta: {
    title: string;
    subtitle?: string | null;
    icon?: string | null;
    color?: ThemeColor | null;
  };
  items: IndexItem[];
}

export interface BreadcrumbItem {
  label: string;
  path: string;
  current?: boolean;
}

export interface LinkItem {
  title?: string | null;
  link?: string | null;
}

export interface IconItem {
  icon?: string | null;
}

export interface ListItem {
  num?: string | null;
  title?: string | null;
  description?: string | null;
}

export interface SlideDocument {
  theme?: string | number | null;
  slug?: string | null;
  color?: ThemeColor | null;
  template: SlideTemplate;
  subtemplate?: string | null;
  sideblockopen?: boolean | null;
  showThemeNumber?: boolean | null;
  title?: string | null;
  description?: string | null;
  icon?: string | null;
  postDescription?: string | null;
  listItems?: ListItem[];
  list?: ListItem[];
  iconList?: IconItem[];
  linksList?: LinkItem[];
  image?: string | null;
  iframe?: string | null;
  coverImg?: string | null;
  download?: boolean;
  downloadLink?: string | null;
  mgContent?: string | null;
  mgCode?: string | null;
  mgLogo?: string | null;
  mgTitle?: string | null;
  mgUrl?: string | null;
  mgUrlTitle?: string | null;
  mgLinksList?: LinkItem[];
  mgIconList?: IconItem[];
  mgListItems?: ListItem[];
  mgListType?: 'bullet' | 'numbered';
  mgIconListSpace?: boolean;
  mgIconListSeparator?: boolean;
}

export interface DeckDocument {
  kind: 'deck';
  path: string;
  slides: SlideDocument[];
}

export type AppDocument = IndexDocument | DeckDocument;

export interface RuntimeResponse {
  versionId: string;
  documentsByPath: Record<string, AppDocument>;
}

export interface PhasedItem<T> {
  key: string;
  item: T;
  phase: ContentPhase;
}

export interface SlideTemplateProps {
  slide: SlideDocument;
  slug: string;
  comparisonSlide?: SlideDocument | null;
  bodyPhase?: ContentPhase;
  motionActive?: boolean;
  direction?: Direction;
}

export interface MagicBoxProps {
  slide: SlideDocument;
  slug: string;
  tone?: MagicBoxTone;
  comparisonSlide?: SlideDocument | null;
  bodyPhase?: ContentPhase;
  motionActive?: boolean;
  direction?: Direction;
}

export interface IndexRowProps {
  label: string;
  icon?: string | null;
  leadingText?: string | null;
  trailingIcon?: string | null;
  href?: string | null;
  target?: string | null;
  disabled?: boolean | null;
  active?: boolean;
  accentColor?: string | null;
  variant?: NavRowVariant;
  onActivate?: (() => void) | null;
}

export interface SlideFrameProps {
  slide: SlideDocument;
  slug: string;
  accentColor: string;
  motionActive?: boolean;
}

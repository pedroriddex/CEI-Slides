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

/**
 * Data for the secondary "magic box" panel that some slides render alongside
 * the main body. All fields are optional — an empty object just means the
 * slide has no magic box.
 */
export interface MagicBoxData {
  title?: string | null;
  content?: string | null;
  code?: string | null;
  logo?: string | null;
  url?: string | null;
  urlTitle?: string | null;
  linksList?: LinkItem[];
  iconList?: IconItem[];
  listItems?: ListItem[];
  listType?: 'bullet' | 'numbered';
  iconListSpace?: boolean;
  iconListSeparator?: boolean;
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
  /**
   * Data rendered in the secondary "magic box" panel. Callers should read it
   * via `getMagicBox(slide)` to get a non-null view with sensible defaults.
   * Legacy RPC payloads that ship `mgTitle`, `mgContent`, etc. at the top
   * level are converted into this subobject by `content-registry`.
   */
  magicBox?: MagicBoxData;
  /**
   * Legacy Studio/YAML magic-box fields. The runtime parser normalizes these
   * into `magicBox`, but keeping them typed lets Studio drafts and generated
   * static bundles preserve the editorial contract during the migration.
   */
  mgTitle?: string | null;
  mgContent?: string | null;
  mgCode?: string | null;
  mgLogo?: string | null;
  mgUrl?: string | null;
  mgUrlTitle?: string | null;
  mgLinksList?: LinkItem[];
  mgIconList?: IconItem[];
  mgListItems?: ListItem[];
  mgListType?: 'bullet' | 'numbered' | null;
  mgIconListSpace?: boolean | null;
  mgIconListSeparator?: boolean | null;
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

export interface RuntimeBundle {
  versionId: string;
  documents: Record<string, AppDocument>;
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

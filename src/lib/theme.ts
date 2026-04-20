import type {ThemeColor} from './types';

const ACCENT_VALUE_MAP: Record<ThemeColor, string> = {
  red: 'var(--editor-accent-red)',
  blue: 'var(--editor-accent-blue)',
  yellow: 'var(--editor-accent-yellow)',
  black: 'var(--editor-accent-black)',
};

export function accentClasses(color: ThemeColor = 'black') {
  return `theme-accent theme-accent--${color}`;
}

export function accentBorderClasses(color: ThemeColor = 'black') {
  return `theme-accent-border theme-accent-border--${color}`;
}

export function colorValue(color: ThemeColor = 'black') {
  return ACCENT_VALUE_MAP[color] || ACCENT_VALUE_MAP.black;
}

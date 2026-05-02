/**
 * Small helpers shared by the list/icon-list/link blocks so each one
 * only has to declare its own item template.
 */

import type {Direction, PhasedItem} from './types';

/**
 * Returns `true` if any item is currently transitioning or if the block
 * is in a globally active motion state. Used to toggle the
 * `motion-auto-size` wrapper.
 */
export function isPhasedActive<T>(items: PhasedItem<T>[], motionActive: boolean): boolean {
  if (motionActive) return true;
  for (const entry of items) {
    if (entry.phase !== 'idle') return true;
  }
  return false;
}

/**
 * Builds the `slide-motion-shell slide-motion-shell--<phase>
 * slide-motion-shell--<direction>` class string that every phased block
 * applies to its item element. Optional `extra` is appended in front.
 */
export function motionShellClass<T>(entry: PhasedItem<T>, direction: Direction, extra = ''): string {
  const base = `slide-motion-shell slide-motion-shell--${entry.phase} slide-motion-shell--${direction}`;
  return extra ? `${extra} ${base}` : base;
}

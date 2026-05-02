/**
 * Development-only logging helpers.
 *
 * All call sites go through these wrappers so production bundles can tree-shake
 * the `console.debug` / `console.warn` calls away and we avoid sprinkling
 * `if (import.meta.env.DEV)` checks around the codebase.
 *
 * The `namespace` argument is always prepended as `[namespace]` so logs stay
 * grep-friendly when filtering the devtools console. Use kebab-case namespaces
 * that match the subsystem that is emitting the log (e.g. `slide-transition`,
 * `selective-resize-gate`, `assets`).
 */

export function devDebug(namespace: string, ...details: unknown[]): void {
  if (import.meta.env.DEV) {
    console.debug(`[${namespace}]`, ...details);
  }
}

export function devWarn(namespace: string, ...details: unknown[]): void {
  if (import.meta.env.DEV) {
    console.warn(`[${namespace}]`, ...details);
  }
}

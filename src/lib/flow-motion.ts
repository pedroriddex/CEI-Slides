/**
 * Flow motion helpers.
 *
 * Provides FLIP-style snapshot/replay for flow children and a height
 * animation helper backed by the Web Animations API. The height animation
 * uses `Animation.finished` so the promise resolves exactly when the
 * animation ends — no setTimeout drift, no symbols stored on the element.
 */

export const FLOW_RESIZE_DURATION = 180;
const FLOW_EASE = 'cubic-bezier(0.2, 0.9, 0.24, 1)';

/**
 * Upper-bound guard for selective resize sequences, used by downstream
 * components that need to short-circuit a stuck resize. Calibrated to
 * cover a short chain of queued resizes with margin.
 */
export const FLOW_RESIZE_GUARD_MS = FLOW_RESIZE_DURATION * 4 + 40;

export interface FlowRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface FlowSnapshot {
  height: number;
  rects: Map<string, FlowRect>;
}

const activeHeightAnimations = new WeakMap<HTMLElement, Animation>();

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function readHeight(element: HTMLElement) {
  return Math.ceil(element.scrollHeight || element.getBoundingClientRect().height);
}

function findFlowChildren(container: HTMLElement) {
  return Array.from(container.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement && Boolean(child.dataset.flowKey)
  );
}

export function captureFlowSnapshot(container: HTMLElement | null): FlowSnapshot | null {
  if (!container) return null;

  const containerRect = container.getBoundingClientRect();
  const rects = new Map<string, FlowRect>();

  for (const child of findFlowChildren(container)) {
    const key = child.dataset.flowKey;
    if (!key) continue;

    const rect = child.getBoundingClientRect();
    rects.set(key, {
      top: rect.top - containerRect.top,
      left: rect.left - containerRect.left,
      width: rect.width,
      height: rect.height
    });
  }

  return {
    height: readHeight(container),
    rects
  };
}

export function animateFlowChildren(
  container: HTMLElement | null,
  snapshot: FlowSnapshot | null,
  duration = 360,
  easing = FLOW_EASE
) {
  if (!container || !snapshot || reducedMotion()) return;

  const containerRect = container.getBoundingClientRect();

  for (const child of findFlowChildren(container)) {
    const key = child.dataset.flowKey;
    if (!key) continue;

    const previousRect = snapshot.rects.get(key);
    if (!previousRect) continue;

    const nextRect = child.getBoundingClientRect();
    const deltaX = previousRect.left - (nextRect.left - containerRect.left);
    const deltaY = previousRect.top - (nextRect.top - containerRect.top);

    if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) continue;

    child.animate(
      [
        {transform: `translate3d(${deltaX}px, ${deltaY}px, 0)`},
        {transform: 'translate3d(0, 0, 0)'}
      ],
      {
        duration,
        easing
      }
    );
  }
}

function clearHeightStyles(element: HTMLElement) {
  element.style.height = '';
  element.style.overflow = '';
  element.style.willChange = '';
}

/**
 * Animates the height of an element from `from` to `to` using the Web
 * Animations API. The returned promise resolves `true` when the animation
 * completes, and `false` if a new animation supersedes this one or if the
 * delta is too small to animate.
 */
export function animateElementHeight(
  element: HTMLElement | null,
  from: number,
  to: number,
  duration = FLOW_RESIZE_DURATION,
  easing = FLOW_EASE
): Promise<boolean> {
  if (!element || Math.abs(to - from) < 1) return Promise.resolve(false);

  const previous = activeHeightAnimations.get(element);
  if (previous) {
    previous.cancel();
    activeHeightAnimations.delete(element);
  }

  if (reducedMotion()) {
    clearHeightStyles(element);
    return Promise.resolve(true);
  }

  element.style.overflow = 'hidden';
  element.style.willChange = 'height';

  const animation = element.animate(
    [{height: `${from}px`}, {height: `${to}px`}],
    {duration, easing, fill: 'both'}
  );

  activeHeightAnimations.set(element, animation);

  return animation.finished.then(
    () => {
      if (activeHeightAnimations.get(element) !== animation) return false;
      activeHeightAnimations.delete(element);
      animation.cancel();
      clearHeightStyles(element);
      return true;
    },
    () => {
      // `.cancel()` rejects the finished promise with an AbortError.
      // That is the expected path when a newer animation supersedes
      // this one, so we resolve cleanly with `false`.
      if (activeHeightAnimations.get(element) === animation) {
        activeHeightAnimations.delete(element);
        clearHeightStyles(element);
      }
      return false;
    }
  );
}

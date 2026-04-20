const ACTIVE_TIMEOUT = Symbol('active-timeout');
const ACTIVE_RESOLVE = Symbol('active-resolve');
export const FLOW_RESIZE_DURATION = 180;
const FLOW_EASE = 'cubic-bezier(0.2, 0.9, 0.24, 1)';

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

export function animateFlowChildren(container: HTMLElement | null, snapshot: FlowSnapshot | null, duration = 360, easing = FLOW_EASE) {
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

export function animateElementHeight(
  element: HTMLElement | null,
  from: number,
  to: number,
  duration = FLOW_RESIZE_DURATION,
  easing = FLOW_EASE
) {
  if (!element || Math.abs(to - from) < 1) return Promise.resolve(false);

  const existingTimeout = (element as HTMLElement & {[ACTIVE_TIMEOUT]?: number})[ACTIVE_TIMEOUT];
  if (existingTimeout) {
    window.clearTimeout(existingTimeout);
  }

  const existingResolve = (element as HTMLElement & {[ACTIVE_RESOLVE]?: ((changed: boolean) => void) | undefined})[ACTIVE_RESOLVE];
  if (existingResolve) {
    existingResolve(false);
  }

  if (reducedMotion()) {
    element.style.height = '';
    element.style.overflow = '';
    element.style.willChange = '';
    element.style.transition = '';
    return Promise.resolve(true);
  }

  return new Promise<boolean>((resolve) => {
    element.style.overflow = 'hidden';
    element.style.willChange = 'height';
    element.style.transition = 'none';
    element.style.height = `${from}px`;
    element.getBoundingClientRect();

    requestAnimationFrame(() => {
      element.style.transition = `height ${duration}ms ${easing}`;
      element.style.height = `${to}px`;
    });

    const cleanup = (changed: boolean) => {
      element.style.height = '';
      element.style.overflow = '';
      element.style.willChange = '';
      element.style.transition = '';
      (element as HTMLElement & {[ACTIVE_TIMEOUT]?: number})[ACTIVE_TIMEOUT] = undefined;
      (element as HTMLElement & {[ACTIVE_RESOLVE]?: ((changed: boolean) => void) | undefined})[ACTIVE_RESOLVE] = undefined;
      resolve(changed);
    };

    const timeout = window.setTimeout(() => cleanup(true), duration + 80);
    (element as HTMLElement & {[ACTIVE_TIMEOUT]?: number})[ACTIVE_TIMEOUT] = timeout;
    (element as HTMLElement & {[ACTIVE_RESOLVE]?: ((changed: boolean) => void) | undefined})[ACTIVE_RESOLVE] = cleanup;
  });
}

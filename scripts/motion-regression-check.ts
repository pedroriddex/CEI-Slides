import {chromium, type Page} from 'playwright';
import {resolveSlideTransitionMode} from '../src/lib/slide-transition.ts';
import type {SlideDocument, SlideTransitionMode} from '../src/lib/types.ts';

const BASE_URL = 'http://localhost:4174';
const SAMPLE_MS = 42;
const DURATION_MS = 920;

type RouteCase = {
  name: string;
  path: string;
  from: number;
  to: number;
  expectedMode: SlideTransitionMode;
  maxUnlockMs?: number;
  check: (page: Page) => Promise<void>;
};

type Sample = {
  t: number;
  bodyPhase: string | null;
  visibilityHiddenCount: number;
  viewportHeight: number | null;
  currentText: string | null;
  currentOpacity: number | null;
  currentVisibility: string | null;
  currentTop: number | null;
  rootPhase: string | null;
};

function routeUrl(path: string, slide: number) {
  return `${BASE_URL}/?path=${encodeURIComponent(path)}&slide=${slide}`;
}

async function waitForDeck(page: Page, path: string, slide: number) {
  await page.goto(routeUrl(path, slide));
  await page.waitForSelector('deck-viewer');
  await page.waitForTimeout(1200);
}

async function readSlides(page: Page) {
  return page.evaluate(() => {
    const deck = document.querySelector('deck-viewer') as (HTMLElement & {document?: {slides?: SlideDocument[]}}) | null;
    return deck?.document?.slides ?? [];
  });
}

function assertMode(name: string, slides: SlideDocument[], from: number, to: number, expected: SlideTransitionMode) {
  const actual = resolveSlideTransitionMode(slides[from] ?? null, slides[to] ?? null).mode;
  if (actual !== expected) {
    throw new Error(`${name}: expected ${expected}, got ${actual}`);
  }
}

async function startSampling(page: Page) {
  await page.evaluate(
    ({durationMs, sampleMs}) => {
      const deck = document.querySelector('deck-viewer') as (HTMLElement & {bodyPhase?: string}) | null;
      const root = document.querySelector('.slide-frame') as HTMLElement | null;
      const samples: Sample[] = [];
      const start = performance.now();
      (window as Window & {__motionSamples?: Sample[]}).__motionSamples = samples;

      const tick = () => {
        const current = document.querySelector('.slide-image-copy-motion__current') as HTMLElement | null;
        const viewport = document.querySelector('.slide-image-copy-motion__viewport') as HTMLElement | null;
        const hiddenShells = [...document.querySelectorAll('.slide-motion-shell')]
          .map((node) => getComputedStyle(node as Element).visibility)
          .filter((visibility) => visibility === 'hidden').length;
        const currentRect = current?.getBoundingClientRect();
        const viewportRect = viewport?.getBoundingClientRect();

        samples.push({
          t: Math.round(performance.now() - start),
          bodyPhase: deck?.bodyPhase ?? null,
          visibilityHiddenCount: hiddenShells,
          viewportHeight: viewportRect ? Math.round(viewportRect.height) : null,
          currentText: current?.textContent?.trim() ?? null,
          currentOpacity: current ? Number.parseFloat(getComputedStyle(current).opacity) : null,
          currentVisibility: current ? getComputedStyle(current).visibility : null,
          currentTop: currentRect ? Math.round(currentRect.top) : null,
          rootPhase: root?.getAttribute('class') ?? null
        });

        if (performance.now() - start < durationMs) {
          window.setTimeout(tick, sampleMs);
        }
      };

      tick();
    },
    {durationMs: DURATION_MS, sampleMs: SAMPLE_MS}
  );
}

async function collectSamples(page: Page) {
  await page.waitForTimeout(DURATION_MS + 80);
  return page.evaluate(() => (window as Window & {__motionSamples?: Sample[]}).__motionSamples ?? []);
}

async function runTransition(page: Page, routeCase: RouteCase) {
  await waitForDeck(page, routeCase.path, routeCase.from);
  const slides = await readSlides(page);
  assertMode(routeCase.name, slides, routeCase.from, routeCase.to, routeCase.expectedMode);
  await startSampling(page);
  await page.evaluate(({durationMs, sampleMs}) => {
    const deck = document.querySelector('deck-viewer');
    const samples: Array<{t: number; isNavigating: boolean}> = [];
    const start = performance.now();
    (window as Window & {__unlockSamples?: Array<{t: number; isNavigating: boolean}>}).__unlockSamples = samples;
    const tick = () => {
      samples.push({
        t: Math.round(performance.now() - start),
        isNavigating: Boolean(deck && 'isNavigating' in deck && (deck as {isNavigating?: boolean}).isNavigating)
      });
      if (performance.now() - start < durationMs) {
        window.setTimeout(tick, sampleMs);
      }
    };
    tick();
  }, {durationMs: DURATION_MS, sampleMs: SAMPLE_MS});
  const label = routeCase.to > routeCase.from ? 'Siguiente' : 'Anterior';
  await page.getByRole('button', {name: label}).click();
  await routeCase.check(page);
  if (routeCase.maxUnlockMs) {
    const unlockSamples = await page.evaluate(() => (window as Window & {__unlockSamples?: Array<{t: number; isNavigating: boolean}>}).__unlockSamples ?? []);
    const unlockedAt = unlockSamples.find((sample) => sample.t > 50 && sample.isNavigating === false)?.t ?? Number.POSITIVE_INFINITY;
    if (unlockedAt > routeCase.maxUnlockMs) {
      throw new Error(`${routeCase.name}: navigation unlocked at ${unlockedAt}ms (max ${routeCase.maxUnlockMs}ms)`);
    }
  }
}

function assertNoHiddenShells(name: string, samples: Sample[]) {
  const hidden = samples.filter((sample) => sample.visibilityHiddenCount > 0);
  if (hidden.length > 0) {
    throw new Error(`${name}: found visibility:hidden on shared motion shells`);
  }
}

function assertHasEnterProgress(name: string, samples: Sample[]) {
  const heights = samples.map((sample) => sample.viewportHeight).filter((value): value is number => typeof value === 'number');
  const distinct = [...new Set(heights)];
  if (distinct.length < 4) {
    throw new Error(`${name}: viewport height did not interpolate with enough intermediate steps`);
  }
}

function assertNoLargeTopJump(name: string, samples: Sample[]) {
  const visible = samples.filter((sample) => sample.currentText && sample.currentOpacity !== null && sample.currentOpacity > 0.05 && sample.currentTop !== null);
  for (let index = 1; index < visible.length; index += 1) {
    const delta = Math.abs((visible[index]?.currentTop ?? 0) - (visible[index - 1]?.currentTop ?? 0));
    if (delta > 18) {
      throw new Error(`${name}: detected a late vertical jump of ${delta}px`);
    }
  }
}

function assertNoExitReappear(name: string, samples: Sample[]) {
  const afterOut = samples.filter((sample) => sample.t >= 220);
  const reappears = afterOut.some((sample) => (sample.currentText ?? '').length > 0 && (sample.currentOpacity ?? 0) > 0.1);
  if (reappears) {
    throw new Error(`${name}: outgoing image copy reappeared after the selective exit`);
  }
}

function assertWholeFramePhases(name: string, samples: Sample[]) {
  const phases = samples.map((sample) => sample.rootPhase || '').join(' ');
  if (!phases.includes('slide-frame--phase-exit') || !phases.includes('slide-frame--phase-enter')) {
    throw new Error(`${name}: whole-frame transition phases were not observed`);
  }
}

async function checkImageEnter(page: Page) {
  const samples = await collectSamples(page);
  assertNoHiddenShells('image enter', samples);
  assertHasEnterProgress('image enter', samples);
  assertNoLargeTopJump('image enter', samples);
}

async function checkImageExit(page: Page) {
  const samples = await collectSamples(page);
  assertNoHiddenShells('image exit', samples);
  assertNoExitReappear('image exit', samples);
}

async function checkSharedSelective(page: Page, name: string) {
  const samples = await collectSamples(page);
  assertNoHiddenShells(name, samples);
}

async function checkWholeTransition(page: Page, name: string) {
  const samples = await collectSamples(page);
  assertWholeFramePhases(name, samples);
}

async function main() {
  const browser = await chromium.launch({channel: 'chrome', headless: true});
  const page = await browser.newPage({viewport: {width: 1280, height: 900}});
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      const text = message.text();
      if (/Failed to load resource: the server responded with a status of 404/i.test(text)) {
        return;
      }
      consoleErrors.push(text);
    }
  });

  const cases: RouteCase[] = [
    {
      name: 'image 6->7 selective',
      path: 'wordpress/theme/figma/atomic-design',
      from: 6,
      to: 7,
      expectedMode: 'selective',
      maxUnlockMs: 450,
      check: (currentPage) => checkImageEnter(currentPage)
    },
    {
      name: 'image 7->6 selective',
      path: 'wordpress/theme/figma/atomic-design',
      from: 7,
      to: 6,
      expectedMode: 'selective',
      maxUnlockMs: 450,
      check: (currentPage) => checkImageExit(currentPage)
    },
    {
      name: 'text selective',
      path: 'wordpress/theme/introduccion/briefing',
      from: 1,
      to: 2,
      expectedMode: 'selective',
      maxUnlockMs: 450,
      check: (currentPage) => checkSharedSelective(currentPage, 'text selective')
    },
    {
      name: 'card selective',
      path: 'wordpress/theme/introduccion/user-flow',
      from: 3,
      to: 4,
      expectedMode: 'selective',
      maxUnlockMs: 450,
      check: (currentPage) => checkSharedSelective(currentPage, 'card selective')
    },
    {
      name: 'whole-same-layout',
      path: 'wordpress/theme/introduccion/ecosistema-del-diseno-web',
      from: 17,
      to: 18,
      expectedMode: 'whole-same-layout',
      check: (currentPage) => checkWholeTransition(currentPage, 'whole-same-layout')
    },
    {
      name: 'whole-layout',
      path: 'wordpress/theme/introduccion/ecosistema-del-diseno-web',
      from: 4,
      to: 5,
      expectedMode: 'whole-layout',
      check: (currentPage) => checkWholeTransition(currentPage, 'whole-layout')
    }
  ];

  try {
    for (const routeCase of cases) {
      await runTransition(page, routeCase);
      console.log(`motion-regression-check: ok - ${routeCase.name}`);
    }

    if (consoleErrors.length > 0) {
      throw new Error(`console errors detected during motion checks:\n${consoleErrors.join('\n')}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

import {resolveSlideTransitionMode} from '../src/lib/slide-transition.ts';
import type {SlideDocument} from '../src/lib/types.ts';

function assertMode(name: string, left: SlideDocument, right: SlideDocument, expected: 'selective' | 'whole-same-layout' | 'whole-layout') {
  const actual = resolveSlideTransitionMode(left, right).mode;
  if (actual !== expected) {
    throw new Error(`${name}: expected ${expected}, got ${actual}`);
  }
}

const baseCard: SlideDocument = {
  template: 'card',
  sideblockopen: true
};

assertMode(
  'same layout + empty groups',
  {
    ...baseCard,
    title: 'A',
    description: 'Uno'
  },
  {
    ...baseCard,
    title: 'B',
    description: 'Dos',
    mgListType: 'bullet',
    mgIconListSpace: false,
    mgIconListSeparator: false
  },
  'whole-same-layout'
);

assertMode(
  'same layout + empty media',
  {
    ...baseCard,
    title: 'A'
  },
  {
    ...baseCard,
    title: 'B',
    image: '',
    iframe: '',
    coverImg: ''
  },
  'whole-same-layout'
);

assertMode(
  'same layout + shared description',
  {
    ...baseCard,
    title: 'A',
    description: 'Compartida'
  },
  {
    ...baseCard,
    title: 'B',
    description: 'Compartida'
  },
  'selective'
);

assertMode(
  'same layout + shared media',
  {
    ...baseCard,
    title: 'A',
    image: '/foo.png'
  },
  {
    ...baseCard,
    title: 'B',
    image: '/foo.png'
  },
  'selective'
);

assertMode(
  'different layout',
  {
    template: 'text',
    sideblockopen: false,
    title: 'A'
  },
  {
    template: 'card',
    sideblockopen: true,
    title: 'A'
  },
  'whole-layout'
);

console.log('slide-transition-check: ok');

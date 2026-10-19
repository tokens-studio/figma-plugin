// Frames exported from the storyboards in the "TS - TSFF Plugin" Figma file (Work in Progress → Anim_Feature 1–4),
// optimised with svgo and with the shared pink background removed. Each media slot plays its frames in order.
import type { UpgradeMediaId } from '../upgradeFeatures';

import plus1 from './frames/plus-1.svg?url';
import themes11 from './frames/themes-1-1.svg?url';
import themes12 from './frames/themes-1-2.svg?url';
import themes21 from './frames/themes-2-1.svg?url';
import themes22 from './frames/themes-2-2.svg?url';
import themes23 from './frames/themes-2-3.svg?url';
import themes24 from './frames/themes-2-4.svg?url';
import themes25 from './frames/themes-2-5.svg?url';
import themes31 from './frames/themes-3-1.svg?url';
import themes32 from './frames/themes-3-2.svg?url';
import themes33 from './frames/themes-3-3.svg?url';
import themes34 from './frames/themes-3-4.svg?url';
import themes35 from './frames/themes-3-5.svg?url';
import themes41 from './frames/themes-4-1.svg?url';
import themes42 from './frames/themes-4-2.svg?url';
import themes43 from './frames/themes-4-3.svg?url';
import themes44 from './frames/themes-4-4.svg?url';
import themes45 from './frames/themes-4-5.svg?url';
import multiFileSync101 from './frames/multiFileSync-1-01.svg?url';
import multiFileSync102 from './frames/multiFileSync-1-02.svg?url';
import multiFileSync103 from './frames/multiFileSync-1-03.svg?url';
import multiFileSync104 from './frames/multiFileSync-1-04.svg?url';
import multiFileSync105 from './frames/multiFileSync-1-05.svg?url';
import multiFileSync106 from './frames/multiFileSync-1-06.svg?url';
import multiFileSync107 from './frames/multiFileSync-1-07.svg?url';
import multiFileSync108 from './frames/multiFileSync-1-08.svg?url';
import multiFileSync109 from './frames/multiFileSync-1-09.svg?url';
import multiFileSync110 from './frames/multiFileSync-1-10.svg?url';
import branching11 from './frames/branching-1-1.svg?url';
import branching12 from './frames/branching-1-2.svg?url';
import branching13 from './frames/branching-1-3.svg?url';
import branching14 from './frames/branching-1-4.svg?url';
import branching15 from './frames/branching-1-5.svg?url';
import branching16 from './frames/branching-1-6.svg?url';
import branching17 from './frames/branching-1-7.svg?url';
import branching18 from './frames/branching-1-8.svg?url';
import branching19 from './frames/branching-1-9.svg?url';
import docsGenerator11 from './frames/docsGenerator-1-1.svg?url';
import docsGenerator12 from './frames/docsGenerator-1-2.svg?url';
import docsGenerator13 from './frames/docsGenerator-1-3.svg?url';

export type StoryboardBackground = 'default' | 'zoomed';

export type Storyboard = {
  frames: string[];
  // Multi-file sync is drawn on a closer crop of the shared background.
  background: StoryboardBackground;
};

export const storyboards: Partial<Record<UpgradeMediaId, Storyboard>> = {
  plus: { frames: [plus1], background: 'default' },
  'themes-1': { frames: [themes11, themes12], background: 'default' },
  'themes-2': { frames: [themes21, themes22, themes23, themes24, themes25], background: 'default' },
  'themes-3': { frames: [themes31, themes32, themes33, themes34, themes35], background: 'default' },
  'themes-4': { frames: [themes41, themes42, themes43, themes44, themes45], background: 'default' },
  'multiFileSync-1': { frames: [multiFileSync101, multiFileSync102, multiFileSync103, multiFileSync104, multiFileSync105, multiFileSync106, multiFileSync107, multiFileSync108, multiFileSync109, multiFileSync110], background: 'zoomed' },
  'branching-1': { frames: [branching11, branching12, branching13, branching14, branching15, branching16, branching17, branching18, branching19], background: 'default' },
  'docsGenerator-1': { frames: [docsGenerator11, docsGenerator12, docsGenerator13], background: 'default' },
};

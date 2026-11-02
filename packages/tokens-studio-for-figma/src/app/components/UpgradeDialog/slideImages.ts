// One image per slide, named after the slide. To use final artwork, overwrite the file in ./images with
// the same name (418×235). Images can leave out the pink background; the dialog draws it behind them.
import type { UpgradeMediaId } from './upgradeFeatures';

import plus from './images/plus.svg?url';
import themes1 from './images/themes-1.svg?url';
import themes2 from './images/themes-2.svg?url';
import themes3 from './images/themes-3.svg?url';
import themes4 from './images/themes-4.svg?url';
import branching1 from './images/branching-1.svg?url';
import multiFileSync1 from './images/multiFileSync-1.svg?url';
import tokenFlow1 from './images/tokenFlow-1.svg?url';
import compositionTokens1 from './images/compositionTokens-1.svg?url';
import compositionTokens2 from './images/compositionTokens-2.svg?url';
import colorModifiers1 from './images/colorModifiers-1.svg?url';
import colorModifiers2 from './images/colorModifiers-2.svg?url';
import colorModifiers3 from './images/colorModifiers-3.svg?url';
import docsGenerator1 from './images/docsGenerator-1.svg?url';
import docsGenerator2 from './images/docsGenerator-2.svg?url';

export const slideImages: Record<UpgradeMediaId, string> = {
  plus,
  'themes-1': themes1,
  'themes-2': themes2,
  'themes-3': themes3,
  'themes-4': themes4,
  'branching-1': branching1,
  'multiFileSync-1': multiFileSync1,
  'tokenFlow-1': tokenFlow1,
  'compositionTokens-1': compositionTokens1,
  'compositionTokens-2': compositionTokens2,
  'colorModifiers-1': colorModifiers1,
  'colorModifiers-2': colorModifiers2,
  'colorModifiers-3': colorModifiers3,
  'docsGenerator-1': docsGenerator1,
  'docsGenerator-2': docsGenerator2,
};

// Multi-file sync is drawn on a closer crop of the shared background.
export const zoomedBackgroundSlides: UpgradeMediaId[] = ['multiFileSync-1'];

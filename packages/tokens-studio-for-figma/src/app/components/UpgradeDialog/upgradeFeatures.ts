export type UpgradeFeature =
  | 'themes'
  | 'branching'
  | 'multiFileSync'
  | 'tokenFlow'
  | 'compositionTokens'
  | 'colorModifiers'
  | 'docsGenerator';

// Identifies the image shown above a slide. 'plus' is the shared "Get more with Plus" slide.
export type UpgradeMediaId =
  | 'plus'
  | 'themes-1' | 'themes-2' | 'themes-3' | 'themes-4'
  | 'branching-1'
  | 'multiFileSync-1'
  | 'tokenFlow-1'
  | 'compositionTokens-1' | 'compositionTokens-2'
  | 'colorModifiers-1' | 'colorModifiers-2' | 'colorModifiers-3'
  | 'docsGenerator-1' | 'docsGenerator-2';

export type UpgradeSlide = {
  media: UpgradeMediaId;
  // Keys in the `upgrade` namespace; the final slide is shared and built by the dialog.
  headingKey: string;
  bodyKey: string;
};

// Explainer slides shown before the shared "Unlock with Starter Plus" slide.
export const upgradeFeatureSlides: Record<UpgradeFeature, UpgradeSlide[]> = {
  themes: [1, 2, 3, 4].map((n) => ({
    media: `themes-${n}` as UpgradeMediaId,
    headingKey: `features.themes.slides.${n}.heading`,
    bodyKey: `features.themes.slides.${n}.body`,
  })),
  branching: [{ media: 'branching-1', headingKey: 'features.branching.slides.1.heading', bodyKey: 'features.branching.slides.1.body' }],
  multiFileSync: [{ media: 'multiFileSync-1', headingKey: 'features.multiFileSync.slides.1.heading', bodyKey: 'features.multiFileSync.slides.1.body' }],
  tokenFlow: [{ media: 'tokenFlow-1', headingKey: 'features.tokenFlow.slides.1.heading', bodyKey: 'features.tokenFlow.slides.1.body' }],
  compositionTokens: [1, 2].map((n) => ({
    media: `compositionTokens-${n}` as UpgradeMediaId,
    headingKey: `features.compositionTokens.slides.${n}.heading`,
    bodyKey: `features.compositionTokens.slides.${n}.body`,
  })),
  colorModifiers: [1, 2, 3].map((n) => ({
    media: `colorModifiers-${n}` as UpgradeMediaId,
    headingKey: `features.colorModifiers.slides.${n}.heading`,
    bodyKey: `features.colorModifiers.slides.${n}.body`,
  })),
  docsGenerator: [1, 2].map((n) => ({
    media: `docsGenerator-${n}` as UpgradeMediaId,
    headingKey: `features.docsGenerator.slides.${n}.heading`,
    bodyKey: `features.docsGenerator.slides.${n}.body`,
  })),
};

// Features listed under "You'll also get access to…"; the one being promoted is left out.
export const includedFeatureKeys = ['themes', 'branching', 'multiFileSync', 'advancedTokens', 'tokenFlow', 'tokenAutomation'] as const;

export const TRIAL_URL = 'https://tokens.studio/trial';

export function getTrialUrl(feature: UpgradeFeature) {
  return `${TRIAL_URL}?ref=figma-plugin&utm_source=figma-plugin&utm_medium=upgrade-dialog&utm_campaign=${encodeURIComponent(feature)}`;
}

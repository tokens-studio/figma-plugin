import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';

export const OnboardingFlagProperty = new FigmaStorageProperty<number>(
  FigmaStorageType.CLIENT_STORAGE,
  'onboardingFlag',
);

import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';

export const OnboardingFlagProperty = new FigmaStorageProperty<boolean>(
  FigmaStorageType.CLIENT_STORAGE,
  'onboardingFlag',
  (value) => String(value),
);

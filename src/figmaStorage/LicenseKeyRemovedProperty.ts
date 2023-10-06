import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';

export const LicenseKeyRemovedProperty = new FigmaStorageProperty<boolean>(
  FigmaStorageType.CLIENT_STORAGE,
  'isLicenseKeyRemoved',
);

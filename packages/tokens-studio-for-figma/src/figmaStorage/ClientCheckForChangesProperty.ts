import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';

export const ClientCheckForChangesProperty = new FigmaStorageProperty<boolean>(
  FigmaStorageType.CLIENT_STORAGE,
  'tokens/checkForChanges',
  (value) => JSON.stringify(value),
  (value) => {
    try {
      return value ? JSON.parse(value) : false;
    } catch (e) {
      return false;
    }
  },
);

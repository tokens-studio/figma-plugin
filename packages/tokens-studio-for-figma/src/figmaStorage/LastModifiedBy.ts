import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';

export const LastModifiedByProperty = new FigmaStorageProperty<string>(
  FigmaStorageType.CLIENT_STORAGE,
  'lastModifiedBy',
);

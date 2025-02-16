import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';

export const LastModifiedByProperty = new FigmaStorageProperty<string>(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  'lastModifiedBy',
);

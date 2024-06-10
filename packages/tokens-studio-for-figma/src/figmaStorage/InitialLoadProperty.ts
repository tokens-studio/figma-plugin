import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';

export const InitialLoadProperty = new FigmaStorageProperty<boolean>(
  FigmaStorageType.CLIENT_STORAGE,
  'initialLoad',
);

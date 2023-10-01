import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';

export const LastOpenedProperty = new FigmaStorageProperty<number>(
  FigmaStorageType.CLIENT_STORAGE,
  'lastOpened',
  (value) => String(value),
  (value) => parseInt(value, 10),
);

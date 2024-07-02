import { SavedSettings } from '@/plugin/notifiers';
import { tryParseJson } from '@/utils/tryParseJson';
import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';

export const UiSettingsProperty = new FigmaStorageProperty<Partial<SavedSettings>>(
  FigmaStorageType.CLIENT_STORAGE,
  'uiSettings',
  (incoming) => JSON.stringify(incoming),
  (outgoing) => tryParseJson<Partial<SavedSettings>>(outgoing) ?? {},
);

import { tryParseJson } from '@/utils/tryParseJson';
import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';

export const ActiveOrganizationIdProperty = new FigmaStorageProperty<string | null>(
  FigmaStorageType.CLIENT_STORAGE,
  'activeOrganizationId',
  (incoming) => JSON.stringify(incoming),
  (outgoing) => tryParseJson<string>(outgoing),
);

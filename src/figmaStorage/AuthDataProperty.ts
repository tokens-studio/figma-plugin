import { AuthData } from '@/context/AuthContext';
import { tryParseJson } from '@/utils/tryParseJson';
import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';

export const AuthDataProperty = new FigmaStorageProperty<AuthData | null>(
  FigmaStorageType.CLIENT_STORAGE,
  'auth',
  (incoming) => JSON.stringify(incoming),
  (outgoing) => tryParseJson<AuthData>(outgoing),
);

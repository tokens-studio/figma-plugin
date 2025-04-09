import { AnyTokenList } from '@/types/tokens';
import { attemptOrFallback } from '@/utils/attemptOrFallback';
import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';

export const ClientValuesProperty = new FigmaStorageProperty<Record<string, AnyTokenList>>(
  FigmaStorageType.CLIENT_STORAGE,
  'tokens/values',
  (value) => JSON.stringify(value),
  (value) => attemptOrFallback<Record<string, AnyTokenList>>(() => (
    value ? JSON.parse(value) : {}
  ), {}),
);

import compact from 'just-compact';
import type { ThemeObjectsList } from '@/types';
import type { AnyTokenList } from '@/types/tokens';

export function stringifyLastSyncedState<Metadata = null>(
  tokens: Record<string, AnyTokenList>,
  themes: ThemeObjectsList,
  metadata: Metadata,
) {
  return JSON.stringify(compact([
    tokens,
    themes,
    metadata,
  ]), null, 2);
}

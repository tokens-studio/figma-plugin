import type { ThemeObjectsList } from '@/types';
import type { Dispatch } from '@/app/store';
import type { AnyTokenList } from '@/types/tokens';
import { stringifyLastSyncedState } from './stringifyLastSyncedState';

export function saveLastSyncedState<Metadata = null>(
  dispatch: Dispatch,
  tokens: Record<string, AnyTokenList>,
  themes: ThemeObjectsList,
  metadata: Metadata,
) {
  dispatch.tokenState.setLastSyncedState(
    stringifyLastSyncedState(tokens, themes, metadata),
  );
}

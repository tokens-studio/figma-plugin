import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { ToggleManyTokenSetsPayload } from '@/types/payloads';
import type { TokenState } from '../../tokenState';

export function toggleManyTokenSets(state: TokenState, data: ToggleManyTokenSetsPayload): TokenState {
  const oldSetsWithoutInput = Object.fromEntries(
    Object.entries(state.usedTokenSet)
      .filter(([tokenSet]) => !data.sets.includes(tokenSet)),
  );

  if (data.shouldCheck) {
    return {
      ...state,
      // @REAMDE we should deactivate any active theme when toggling token sets
      // since we are then diverging from the pre-selected sets
      activeTheme: null,
      usedTokenSet: {
        ...oldSetsWithoutInput,
        ...Object.fromEntries(data.sets.map((tokenSet) => ([tokenSet, TokenSetStatus.ENABLED]))),
      },
    };
  }

  return {
    ...state,
    // @REAMDE we should deactivate any active theme when toggling token sets
    // since we are then diverging from the pre-selected sets
    activeTheme: null,
    usedTokenSet: {
      ...oldSetsWithoutInput,
      ...Object.fromEntries(data.sets.map((tokenSet) => ([tokenSet, TokenSetStatus.DISABLED]))),
      // @README see comment (1) in tokenState.tsx - ensure that all token sets are always available
    },
  };
}

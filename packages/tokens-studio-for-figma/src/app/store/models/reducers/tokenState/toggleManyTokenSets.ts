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
      activeTheme: {},
      usedTokenSet: {
        ...oldSetsWithoutInput,
        ...Object.fromEntries(data.sets.map((tokenSet) => ([tokenSet, TokenSetStatus.ENABLED]))),
      },
    };
  }

  return {
    ...state,
    activeTheme: {},
    usedTokenSet: {
      ...oldSetsWithoutInput,
      ...Object.fromEntries(data.sets.map((tokenSet) => ([tokenSet, TokenSetStatus.DISABLED]))),
      // @README see comment (1) - ensure that all token sets are always available
    },
  };
}

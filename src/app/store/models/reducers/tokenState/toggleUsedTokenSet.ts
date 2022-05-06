import { TokenSetStatus } from '@/constants/TokenSetStatus';
import type { TokenState } from '../../tokenState';

export function toggleUsedTokenSet(state: TokenState, tokenSet: string): TokenState {
  return {
    ...state,
    // @REAMDE we should deactivate any active theme when toggling token sets
    // since we are then diverging from the pre-selected sets
    activeTheme: null,
    usedTokenSet: {
      ...state.usedTokenSet,
      // @README it was decided the user can not simply toggle to the intermediate SOURCE state
      // this means for toggling we only switch between ENABLED and DISABLED
      // setting as source is a separate action
      [tokenSet]: state.usedTokenSet[tokenSet] === TokenSetStatus.DISABLED
        ? TokenSetStatus.ENABLED
        : TokenSetStatus.DISABLED,
    },
  };
}

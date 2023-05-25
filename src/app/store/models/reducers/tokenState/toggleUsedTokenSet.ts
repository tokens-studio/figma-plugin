import { TokenSetStatus } from '@/constants/TokenSetStatus';
import type { TokenState } from '../../tokenState';

export function toggleUsedTokenSet(state: TokenState, tokenSet: string): TokenState {
  return {
    ...state,
    activeTheme: {},
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

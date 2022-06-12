import { notifyToUI } from '@/plugin/notifiers';
import type { TokenState } from '../../tokenState';
import { updateTokenSetsInState } from '@/utils/tokenset/updateTokenSetsInState';

type Payload = {
  oldName: string
  newName: string
};

export function renameTokenSet(state: TokenState, data: Payload): TokenState {
  if (
    Object.keys(state.tokens).includes(data.newName)
    && data.oldName !== data.newName
  ) {
    notifyToUI('Token set already exists', { error: true });
    return state;
  }

  return updateTokenSetsInState(
    state,
    (setName, tokenSet) => (
      setName === data.oldName
        ? [data.newName, tokenSet]
        : [setName, tokenSet]
    ),
  );
}

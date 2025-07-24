import { notifyToUI } from '@/plugin/notifiers';
import { updateTokenSetsInState } from '@/utils/tokenset/updateTokenSetsInState';
import type { TokenState } from '../../tokenState';

type Payload = {
  oldName: string
  newName: string
};

export function renameTokenSetFolder(state: TokenState, data: Payload): TokenState {
  if (
    Object.keys(state.tokens).includes(data.newName)
    && data.oldName !== data.newName
  ) {
    notifyToUI('Folder name already exists', { error: true });
    return state;
  }

  return updateTokenSetsInState(
    state,
    (setName, tokenSet) => (
      setName.indexOf(data.oldName) === 0 && setName[data.oldName.length] === '/'
        ? [data.newName + setName.slice(data.oldName.length, setName.length), tokenSet]
        : [setName, tokenSet]
    ),
  );
}

import omit from 'just-omit';
import { notifyToUI } from '@/plugin/notifiers';
import type { TokenState } from '../../tokenState';

type Payload = {
  oldName: string
  newName: string
};

export function renameTokenSet(state: TokenState, data: Payload): TokenState {
  const oldTokens = { ...state.tokens };
  if (Object.keys(oldTokens).includes(data.newName) && data.oldName !== data.newName) {
    notifyToUI('Token set already exists', { error: true });
    return state;
  }
  oldTokens[data.newName] = oldTokens[data.oldName];
  delete oldTokens[data.oldName];
  return {
    ...state,
    tokens: oldTokens,
    // @README rename the tokenset in themes
    themes: state.themes.map((theme) => {
      if (data.oldName in theme.selectedTokenSets) {
        return {
          ...theme,
          selectedTokenSets: omit({
            ...theme.selectedTokenSets,
            [data.newName]: theme.selectedTokenSets[data.oldName],
          }, data.oldName),
        };
      }
      return theme;
    }),
    activeTokenSet: state.activeTokenSet === data.oldName ? data.newName : state.activeTokenSet,
  };
}

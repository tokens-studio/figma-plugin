import hash from 'object-hash';
import { ThemeObject } from '@/types';
import type { TokenState } from '../../tokenState';
import { setActiveTheme } from './setActiveTheme';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

type Payload = Omit<ThemeObject, 'id' | '$figmaStyleReferences'> & {
  id?: string
};

export function saveTheme(state: TokenState, data: Payload): TokenState {
  const isNewTheme = !data.id;
  const themeId = data.id || hash([Date.now(), data]);
  const isActiveTheme = state.activeTheme === themeId;
  const themeObject = state.themes.find((theme) => theme.id === themeId);
  const selectedTokenSets = Object.fromEntries(
    Object.entries(data.selectedTokenSets)
      .filter(([, status]) => (status !== TokenSetStatus.DISABLED)),
  );

  const nextState: TokenState = {
    ...state,
    themes: [
      ...state.themes.filter((theme) => theme.id !== themeId),
      {
        ...themeObject,
        ...data,
        id: themeId,
        $figmaStyleReferences: themeObject?.$figmaStyleReferences ?? {},
        selectedTokenSets,
      },
    ],
  };

  console.log('nextstate', nextState);

  if (isActiveTheme || isNewTheme) {
    // @README if this theme is currently active or if it's a new theme
    // we will also run the setActiveTheme reducer
    // we don't want to update nodes or styles though.
    return setActiveTheme(nextState, { themeId, shouldUpdateNodes: false });
  }

  return nextState;
}

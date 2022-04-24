import hash from 'object-hash';
import { ThemeObject } from '@/types';
import type { TokenState } from '../../tokenState';
import { setActiveTheme } from './setActiveTheme';

type Payload = Omit<ThemeObject, 'id' | '$figmaStyleReferences'> & {
  id?: string
};

export function saveTheme(state: TokenState, data: Payload): TokenState {
  const themeId = data.id || hash([Date.now(), data]);
  const isActiveTheme = state.activeTheme === themeId;
  const themeObject = state.themes.find((theme) => theme.id === themeId);

  const nextState: TokenState = {
    ...state,
    themes: [
      ...state.themes.filter((theme) => theme.id === themeId),
      {
        ...data,
        id: themeId,
        $figmaStyleReferences: themeObject?.$figmaStyleReferences ?? {},
      },
    ],
  };

  if (isActiveTheme) {
    // @README if this theme is currently active
    // we will also run the setActiveTheme reducer
    // to update the usedTokenSets
    return setActiveTheme(nextState, themeId);
  }

  return nextState;
}

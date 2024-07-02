import { ThemeObjectsList } from '@/types';
import type { TokenState } from '../../tokenState';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';

export function updateThemeGroupName(state: TokenState, oldGroupName: string, newGroupName: string): TokenState {
  const updatedThemes: ThemeObjectsList = [];
  state.themes.forEach((theme) => {
    if (oldGroupName === INTERNAL_THEMES_NO_GROUP && !theme?.group) {
      updatedThemes.push({
        ...theme,
        ...(newGroupName ? { group: newGroupName } : {}),
      });
    } else if (oldGroupName !== INTERNAL_THEMES_NO_GROUP && theme.group === oldGroupName) {
      if (newGroupName) {
        updatedThemes.push({
          ...theme,
          group: newGroupName,
        });
      } else {
        delete theme.group;
        updatedThemes.push(theme);
      }
    } else {
      updatedThemes.push(theme);
    }
  });

  const newActiveTheme = state.activeTheme;
  if (state.activeTheme?.[oldGroupName]) {
    newActiveTheme[newGroupName || INTERNAL_THEMES_NO_GROUP] = newActiveTheme[oldGroupName];
    delete newActiveTheme?.[oldGroupName];
  }
  const nextState: TokenState = {
    ...state,
    themes: updatedThemes,
    activeTheme: newActiveTheme,
  };

  return nextState;
}

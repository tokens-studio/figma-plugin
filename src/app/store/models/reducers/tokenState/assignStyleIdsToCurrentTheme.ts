import type { TokenState } from '../../tokenState';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';

export function assignStyleIdsToCurrentTheme(state: TokenState, styleIds: Record<string, string>, tokens: ResolveTokenValuesResult[]): TokenState {
  // ignore if there is no active themes
  if (Object.keys(state.activeTheme).length < 1) return state;

  const updatedThemes = [...state.themes];
  const activeThemes = state.themes.filter((theme) => Object.values(state.activeTheme).some((v) => v === theme.id));
  Object.entries(styleIds).forEach(([tokenName, styleId]) => {
    // Find the activeTheme object which involved this token
    const activeThemeObject = activeThemes.reverse().find((theme) => Object.entries(theme.selectedTokenSets).some(([tokenSet, status]) => status === TokenSetStatus.ENABLED
        && tokenSet === tokens.find((t) => t.name === tokenName)?.internal__Parent));
    const themeObjectIndex = state.themes.findIndex(({ id }) => activeThemeObject?.id === id);
    if (themeObjectIndex !== -1) {
      updatedThemes.splice(themeObjectIndex, 1, {
        ...state.themes[themeObjectIndex],
        $figmaStyleReferences: { ...state.themes[themeObjectIndex].$figmaStyleReferences, ...{ [tokenName]: styleId } },
      });
    }
  });

  return {
    ...state,
    themes: updatedThemes,
  };
}

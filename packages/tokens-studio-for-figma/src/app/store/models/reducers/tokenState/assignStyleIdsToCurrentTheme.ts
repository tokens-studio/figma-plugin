import type { TokenState } from '../../tokenState';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';

export function assignStyleIdsToCurrentTheme(state: TokenState, { styleIds, tokens, selectedThemes }: { styleIds: Record<string, string>, tokens: ResolveTokenValuesResult[], selectedThemes: string[] }): TokenState {
  // ignore if there is no selectedThemes
  if (selectedThemes.length < 1) return state;

  const updatedThemes = [...state.themes];
  const activeThemes = state.themes.filter((theme) => selectedThemes.some((v) => v === theme.id)).reverse();
  Object.entries(styleIds).forEach(([tokenName, styleId]) => {
    // Find the activeTheme object which involved this token
    const activeTheme = activeThemes.find((theme) => Object.entries(theme.selectedTokenSets).some(([tokenSet, status]) => status === TokenSetStatus.ENABLED
        && tokenSet === tokens.find((t) => t.name === tokenName)?.internal__Parent));
    const themeObjectIndex = state.themes.findIndex(({ id }) => activeTheme?.id === id);
    if (themeObjectIndex !== -1) {
      updatedThemes.splice(themeObjectIndex, 1, {
        ...state.themes[themeObjectIndex],
        $figmaStyleReferences: { ...updatedThemes[themeObjectIndex].$figmaStyleReferences, ...{ [tokenName]: styleId } },
      });
    }
  });

  return {
    ...state,
    themes: updatedThemes,
  };
}

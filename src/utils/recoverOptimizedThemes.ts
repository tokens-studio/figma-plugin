import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { ThemeObjectsList } from '@/types';
import { AnyTokenList } from '@/types/tokens';

export default function recoverOptimizedThemes(themes: ThemeObjectsList, tokens: Record<string, AnyTokenList> | null): ThemeObjectsList {
  if (tokens) {
    const allAvailableTokenSets = Object.keys(tokens);
    return themes.map((theme) => {
      const updatedSelectedTokenSets = Object.fromEntries(
        allAvailableTokenSets
          .map((tokenSet) => ([tokenSet, theme.selectedTokenSets?.[tokenSet] ?? TokenSetStatus.DISABLED])),
      );
      return {
        ...theme,
        selectedTokenSets: updatedSelectedTokenSets,
      };
    });
  }
  return themes;
}

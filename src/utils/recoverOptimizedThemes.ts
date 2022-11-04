import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { ThemeObjectsList } from '@/types';
import { AnyTokenList, SingleToken } from '@/types/tokens';

export default function recoverOptimizedThemes(themes: ThemeObjectsList, tokens: Record<string, AnyTokenList> | SingleToken<true, unknown>[] | null): ThemeObjectsList {
  if (tokens) {
    let allAvailableTokenSets: string[] = [];
    if (Array.isArray(tokens)) {
      allAvailableTokenSets = ['global'];
    } else {
      allAvailableTokenSets = Object.keys(tokens);
    }
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

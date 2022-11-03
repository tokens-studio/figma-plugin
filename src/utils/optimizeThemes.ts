import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { ThemeObjectsList } from '@/types';

export default function optimizeThemes(themes: ThemeObjectsList) {
  return themes.map((theme) => {
    const optimizedSelectedTokenSets = Object.fromEntries(
      Object.entries(theme.selectedTokenSets)
        .filter(([, status]) => status !== TokenSetStatus.DISABLED)
        .map(([tokenSet, status]) => [tokenSet, status]),
    );
    return {
      ...theme,
      selectedTokenSets: optimizedSelectedTokenSets,
    };
  });
}

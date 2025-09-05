import { ThemeObjectsList } from '@/types/ThemeObjectsList';

/**
 * Cleans themes by filtering out disabled token sets from selectedTokenSets
 * @param themes - Array of theme objects to clean
 * @param availableTokenSets - Array of available token set names
 * @returns Cleaned themes with filtered selectedTokenSets
 */
export function cleanThemesSelectedTokenSets(
  themes: ThemeObjectsList,
  availableTokenSets: string[]
): ThemeObjectsList {
  return themes.map((theme) => ({
    ...theme,
    selectedTokenSets: Object.fromEntries(
      Object.entries(theme.selectedTokenSets).filter(
        ([setName, status]) => availableTokenSets.includes(setName) && status !== 'disabled',
      ),
    ),
  }));
}

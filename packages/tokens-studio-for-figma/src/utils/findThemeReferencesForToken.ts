import { ThemeObject } from '@/types/ThemeObject';

export type TokenVariableReference = {
  themeId: string;
  themeName: string;
  variableId: string;
};

/**
 * Find which themes reference a specific token with Figma variables
 * @param tokenName The full token name (e.g., "colors.primary.500")
 * @param themes Array of theme objects
 * @returns Array of theme references that link to this token
 */
export function findThemeReferencesForToken(
  tokenName: string,
  themes: ThemeObject[],
): TokenVariableReference[] {
  const references: TokenVariableReference[] = [];

  themes.forEach((theme) => {
    const variableReferences = theme.$figmaVariableReferences;
    if (variableReferences && variableReferences[tokenName]) {
      references.push({
        themeId: theme.id,
        themeName: theme.name,
        variableId: variableReferences[tokenName],
      });
    }
  });

  return references;
}

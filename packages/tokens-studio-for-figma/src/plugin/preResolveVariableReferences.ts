import { ThemeObject } from '@/types';

/**
 * Pre-resolves all variable references from themes to avoid bricking existing references
 * during variable creation. Only references that can be successfully resolved are cached.
 *
 * @param themes - Array of theme objects containing $figmaVariableReferences
 * @param selectedThemeIds - Optional array of theme IDs to filter by
 * @returns Map of variable IDs to their resolved Variable objects
 */
export async function preResolveVariableReferences(
  themes: ThemeObject[],
  selectedThemeIds?: string[],
): Promise<Map<string, Variable>> {
  const resolvedCache = new Map<string, Variable>();
  const themesToProcess = selectedThemeIds
    ? themes.filter((theme) => selectedThemeIds.includes(theme.id))
    : themes;

  // Collect all unique variable IDs from theme references
  const variableIdsToResolve = new Set<string>();

  themesToProcess.forEach((theme) => {
    if (theme.$figmaVariableReferences) {
      Object.values(theme.$figmaVariableReferences).forEach((variableId) => {
        if (typeof variableId === 'string' && variableId.startsWith('VariableID:')) {
          variableIdsToResolve.add(variableId);
        }
      });
    }
  });

  // Try to resolve each variable ID
  const resolutionPromises = Array.from(variableIdsToResolve).map(async (variableId) => {
    try {
      const variable = await figma.variables.getVariableByIdAsync(variableId);
      if (variable) {
        resolvedCache.set(variableId, variable);
      }
    } catch (e) {
      // Variable doesn't exist or can't be accessed - skip it silently
    }
  });

  await Promise.all(resolutionPromises);

  return resolvedCache;
}

import { ThemeObject } from '@/types';

/**
 * Pre-resolves all variable references from themes to avoid bricking existing references
 * during variable creation. Only references that can be successfully resolved are cached.
 *
 * Handles both:
 * - Local variables using VariableID: format (resolved via getVariableByIdAsync)
 * - Remote/library variables using variable key format (resolved via importVariableByKeyAsync)
 *
 * @param themes - Array of theme objects containing $figmaVariableReferences
 * @param selectedThemeIds - Optional array of theme IDs to filter by
 * @returns Map of variable IDs/keys to their resolved Variable objects
 */
export async function preResolveVariableReferences(
  themes: ThemeObject[],
  selectedThemeIds?: string[],
): Promise<Map<string, Variable>> {
  const resolvedCache = new Map<string, Variable>();
  const themesToProcess = selectedThemeIds
    ? themes.filter((theme) => selectedThemeIds.includes(theme.id))
    : themes;

  // Collect all unique variable references from theme references
  // These can be either VariableID: format (local) or variable keys (remote/library)
  const variableIdsToResolve = new Set<string>();
  const variableKeysToResolve = new Set<string>();

  themesToProcess.forEach((theme) => {
    if (theme.$figmaVariableReferences) {
      Object.values(theme.$figmaVariableReferences).forEach((variableRef) => {
        if (typeof variableRef === 'string') {
          if (variableRef.startsWith('VariableID:')) {
            variableIdsToResolve.add(variableRef);
          } else if (variableRef) {
            // Variable keys (for remote/library variables) don't start with VariableID:
            // We don't validate the key format here since Figma's API will reject invalid keys gracefully
            // and the exact format may vary across different Figma library configurations
            variableKeysToResolve.add(variableRef);
          }
        }
      });
    }
  });

  // Try to resolve each variable ID (local variables)
  const idResolutionPromises = Array.from(variableIdsToResolve).map(async (variableId) => {
    try {
      const variable = await figma.variables.getVariableByIdAsync(variableId);
      if (variable) {
        resolvedCache.set(variableId, variable);
      }
    } catch (e) {
      // Variable doesn't exist or can't be accessed - skip it silently
    }
  });

  // Try to resolve each variable key (remote/library variables)
  const keyResolutionPromises = Array.from(variableKeysToResolve).map(async (variableKey) => {
    try {
      const variable = await figma.variables.importVariableByKeyAsync(variableKey);
      if (variable) {
        resolvedCache.set(variableKey, variable);
      }
    } catch (e) {
      // Variable doesn't exist or can't be accessed - skip it silently
    }
  });

  await Promise.all([...idResolutionPromises, ...keyResolutionPromises]);

  return resolvedCache;
}

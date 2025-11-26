import { ThemeObject } from '@/types';
import { getVariablesWithoutZombies } from './getVariablesWithoutZombies';

// Gather references that we should use. Merge current theme references with the ones from all themes as well as local variables
// Note that this is a bit naive. As the active theme does not have the themes set as active that it should use as a reference, it will not be able to find the correct reference.
// This is why we also pass in allThemes and merge them together. This is naive because it might be that the reference required is not the "first to detect".
// We need to refactor this probably. Themes should be able to strictly specify which other theme the references are coming from, like we do for token sets.
export async function mergeVariableReferencesWithLocalVariables(themes: ThemeObject[] = [], allThemes: ThemeObject[] = [], _validatedVariableCache?: Map<string, Variable>): Promise<Map<string, string>> {
  const localVariables = await getVariablesWithoutZombies();

  const variables = new Map();
  themes.forEach((theme) => {
    if (!theme.$figmaVariableReferences) return;
    Object.entries(theme.$figmaVariableReferences).forEach(([tokenName, variableId]) => {
      // For each variable reference we add one to the global Map - ONLY if it is not already set.
      // Meaning, users will run into problems if they have a token defined in multiple theme groups
      if (variables.has(tokenName)) return;

      // Include all variable references regardless of validation status
      // The validation in updateVariablesToReference will handle cases where variables can't be imported
      // Remote/library variables may not be importable during pre-resolution but can be imported later
      variables.set(tokenName, variableId);
    });
  });
  allThemes.forEach((theme) => {
    if (!theme.$figmaVariableReferences) return;
    Object.entries(theme.$figmaVariableReferences).forEach(([tokenName, variableId]) => {
      // For each variable reference we add one to the global Map - ONLY if it is not already set.
      // Meaning, users will run into problems if they have a token defined in multiple theme groups
      if (variables.has(tokenName)) return;

      // Include all variable references regardless of validation status
      // The validation in updateVariablesToReference will handle cases where variables can't be imported
      // Remote/library variables may not be importable during pre-resolution but can be imported later
      variables.set(tokenName, variableId);
    });
  });
  localVariables.forEach((variable) => {
    const normalizedName = variable.name.split('/').join('.');
    if (variables.has(normalizedName)) return;
    variables.set(normalizedName, variable.key);
  });

  return variables;
}

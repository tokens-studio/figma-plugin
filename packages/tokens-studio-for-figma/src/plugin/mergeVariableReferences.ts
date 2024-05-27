import { ThemeObject } from '@/types';

export async function mergeVariableReferencesWithLocalVariables(themes: ThemeObject[] = []): Promise<Map<string, string>> {
  const localVariables = await figma.variables.getLocalVariablesAsync();
  const localVariableMap = new Map(localVariables.map((variable) => [variable.name, variable]));

  console.log('themes', themes, localVariables);

  const variables = new Map();
  themes.forEach((theme) => {
    if (!theme.$figmaVariableReferences) return;
    Object.entries(theme.$figmaVariableReferences).forEach(([tokenName, variableId]) => {
      // For each variable reference we add one to the global Map - ONLY if it is not already set.
      // Meaning, users will run into problems if they have a token defined in multiple theme groups
      if (variables.has(tokenName)) return;
      if (localVariableMap.has(tokenName) && localVariableMap.get(tokenName)?.variableCollectionId === theme.$figmaCollectionId) {
        variables.set(tokenName, localVariableMap.get(tokenName)?.key);
        return;
      }
      variables.set(tokenName, variableId);
    });
  });
  console.log('theme variables', themes, Array.from(variables.entries()));

  localVariables.forEach((variable) => {
    console.log('found local variable', variable.name, variable.key);

    const normalizedName = variable.name.split('/').join('.');
    if (variables.has(normalizedName)) return;
    variables.set(normalizedName, variable.key);
  });

  return variables;
}

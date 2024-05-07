import { ThemeObject } from '@/types';

export function mergeVariableReferences({themes = [], localVariables}: {themes?: ThemeObject[], localVariables: Variable[]}): Map<string, string> {
  const variables = new Map();
  themes.forEach((theme) => {
    if (!theme.$figmaVariableReferences) return;
    Object.entries(theme.$figmaVariableReferences).forEach(([tokenName, variableId]) => {
      // For each variable reference we add one to the global Map - ONLY if it is not already set.
      // Meaning, users will run into problems if they have a token defined in multiple theme groups
      if (variables.has(tokenName)) return;
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

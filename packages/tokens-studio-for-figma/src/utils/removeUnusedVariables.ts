import { SettingsState } from '@/app/store/models/settings';

/**
 * Remove unused variables from a collection after all modes have been processed
 * This ensures variables used in other modes are not accidentally deleted
 */
export function removeUnusedVariables(
  collection: VariableCollection,
  allUsedVariableKeys: Set<string>,
  settings: SettingsState,
): string[] {
  const removedVariables: string[] = [];

  if (settings.removeStylesAndVariablesWithoutConnection) {
    const variablesInCollection = figma.variables
      .getLocalVariables()
      .filter((v) => v.variableCollectionId === collection.id);

    variablesInCollection
      .filter((variable) => !allUsedVariableKeys.has(variable.key))
      .forEach((variable) => {
        removedVariables.push(variable.key);
        variable.remove();
      });
  }

  return removedVariables;
}

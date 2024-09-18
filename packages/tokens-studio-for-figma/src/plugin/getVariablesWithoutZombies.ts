// Figma has a weird bug where they return variables in getLocalVariables that dont exist anymore.

import { notifyException } from './notifiers';

// So we need to add another check to see if the variable collection exists - if not, it's a zombie variable and we should ignore it.
export async function getVariablesWithoutZombies(): Promise<Variable[]> {
  try {
    const localVariables = await figma.variables.getLocalVariablesAsync();
    const localVariableCollectionIds = await figma.variables.getLocalVariableCollectionsAsync()?.then((collections) => collections.map((collection) => collection.id));
    return localVariables.filter((variable) => localVariableCollectionIds.includes(variable.variableCollectionId));
  } catch (error: any) {
    notifyException(error?.message ?? 'Unknown error');
    return [];
  }
}

export function getAttachedVariable(collection: string, type: VariableResolvedDataType, token: string) {
  const tokenToFind = token.split('.').join('/');
  return figma.variables.getLocalVariables(type).filter((v) => v.variableCollectionId === collection).find((variable) => variable.name === tokenToFind);
}

export function isVariableWithAliasReference(obj: VariableValue): obj is VariableAlias {
  return typeof obj === 'object' && 'id' in obj && typeof obj.id === 'string';
}

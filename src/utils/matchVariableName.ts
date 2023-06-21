export function matchVariableName(
  tokenName: string,
  tokenPath: string,
  figmaVariableReferences: Record<string, string>,
  variableMap?: Record<string, Variable>,
) {
  return (
    figmaVariableReferences[tokenName]
    || variableMap?.[tokenName]?.id
    || figmaVariableReferences[tokenPath]
    || variableMap?.[tokenPath]?.id
  );
}

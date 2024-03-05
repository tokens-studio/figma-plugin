export function matchVariableName(
  tokenName: string,
  tokenPath: string,
  figmaVariableReferences: Map<string, string>,
) {
  return (
    figmaVariableReferences.get(tokenName)
  );
}

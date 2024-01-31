export function getVariablesMap() {
  return figma.variables.getLocalVariables().reduce<Record<string, Variable>>((acc, curr) => {
    acc[curr.key] = curr;
    return acc;
  }, {});
}

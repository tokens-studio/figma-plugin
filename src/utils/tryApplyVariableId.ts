import { matchVariableName } from './matchVariableName';

export async function tryApplyVariableId(node: SceneNode, type: VariableBindableNodeField, token: string, figmaVariableReferences: Record<string, string>, figmaVariableMaps: Record<string, Variable>) {
  const pathname = token.split('.').join('/');
  const matchVariableId = matchVariableName(
    token,
    pathname,
    figmaVariableReferences,
    figmaVariableMaps,
  );

  if (matchVariableId && type in node) {
    const variable = await figma.variables.importVariableByKeyAsync(matchVariableId);
    if (variable) {
      try {
        node.setBoundVariable(type, variable.id);
        if (node.boundVariables?.[type] !== undefined) {
          const figmaVariableId = node?.boundVariables?.[type]?.id;
          if (figmaVariableId) {
            const appliedVariable = await figma.variables.importVariableByKeyAsync(figmaVariableId);
            return appliedVariable?.resolveForConsumer(node).value === node[type as keyof typeof node];
          }
        }
      } catch (e) {
        console.log('error', e);
      }
    }
  }
  return false;
}

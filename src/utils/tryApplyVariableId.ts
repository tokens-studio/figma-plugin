import { matchVariableName } from './matchVariableName';

export async function tryApplyVariableId(node: SceneNode, type: VariableBindableNodeField, token: string, figmaVariableReferences: Record<string, string>, figmaVariableMaps: Record<string, Variable>) {
  if (Object.keys(figmaVariableMaps).length < 1) return false;
  const pathname = token.split('.').join('/');
  const matchVariableId = matchVariableName(
    token,
    pathname,
    figmaVariableReferences,
    figmaVariableMaps,
  );

  if (matchVariableId && type in node) {
    try {
      node.setBoundVariable(type, matchVariableId);
      if (node.boundVariables?.[type] !== undefined) {
        const figmaVariableId = node?.boundVariables?.[type]?.id;
        if (figmaVariableId) {
          const variable = figma.variables.getVariableById(figmaVariableId);
          return variable?.resolveForConsumer(node).value === node[type as keyof typeof node];
        }
      }
    } catch (e) {
      console.log('error', e);
    }
  }
  return false;
}

import { resolvedVariableReferences } from '@/plugin/setValuesOnNode';

export async function tryApplyVariableId(node: SceneNode, type: VariableBindableNodeField, token: string, figmaVariableReferences: Map<string, string>) {
  let variable;
  const hasCachedVariable = resolvedVariableReferences.has(token);
  if (hasCachedVariable) {
    variable = resolvedVariableReferences.get(token);
  }
  const variableMapped = figmaVariableReferences.get(token);
  if (!variableMapped) return false;
  if (!hasCachedVariable && typeof variableMapped === 'string') {
    try {
      const foundVariable = await figma.variables.importVariableByKeyAsync(variableMapped);
      if (foundVariable) {
        resolvedVariableReferences.set(token, foundVariable);
        variable = foundVariable;
      }
    } catch (e) {
      console.log('error importing variable', e);
      Promise.reject(e);
      return false;
    }
  }

  if (variable === undefined) return false;

  if (variable && type in node) {
    try {
      node.setBoundVariable(type, variable.id);
      if (node.boundVariables?.[type] !== undefined) {
        return variable?.resolveForConsumer(node).value === node[type as keyof typeof node];
      }
    } catch (e) {
      console.log('error', e);
    }
  }
  return false;
}

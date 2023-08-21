import { VariableReferenceMap } from '@/types/VariableReferenceMap';

export async function tryApplyVariableId(node: SceneNode, type: VariableBindableNodeField, token: string, figmaVariableReferences: VariableReferenceMap) {
  const variable = figmaVariableReferences.get(token);

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

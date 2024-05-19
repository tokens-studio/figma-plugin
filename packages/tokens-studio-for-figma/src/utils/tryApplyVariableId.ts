import { defaultTokenValueRetriever } from '@/plugin/TokenValueRetriever';

export async function tryApplyVariableId(node: SceneNode, type: VariableBindableNodeField, token: string) {
  const { shouldApplyVariables } = defaultTokenValueRetriever;
  if (!shouldApplyVariables) return false;

  const variable = await defaultTokenValueRetriever.getVariableReference(token);

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

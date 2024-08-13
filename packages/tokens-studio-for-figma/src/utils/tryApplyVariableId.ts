import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';
import { defaultTokenValueRetriever } from '@/plugin/TokenValueRetriever';

export async function tryApplyVariableId(node: SceneNode, type: VariableBindableNodeField, token: string) {
  const { applyVariablesStylesOrRawValue } = defaultTokenValueRetriever;
  if (applyVariablesStylesOrRawValue !== ApplyVariablesStylesOrRawValues.VARIABLES_STYLES) return false;

  const variable = await defaultTokenValueRetriever.getVariableReference(token);

  if (variable && type in node) {
    try {
      node.setBoundVariable(type, variable);
      if (node.boundVariables?.[type] !== undefined) {
        const valueOnVariable = variable.resolveForConsumer(node).value;
        const valueOnNode = node[type as keyof typeof node];
        if (typeof valueOnNode === 'number' && typeof valueOnVariable === 'number' && type === 'opacity') {
          // We need to account for floating point precision errors when comparing numbers
          const epsilon = 0.0001;
          const variableValue = valueOnVariable / 100; // normalize value to 0-1, Figma's variable needs those to be 1-100, but applied they return 0-1
          const isEqual = Math.abs(variableValue - valueOnNode) < epsilon;

          return isEqual;
        }

        // Equality check. If the value on the variable is the same as the value on the node, we consider it a success, otherwise we'd return false and we'd apply the raw value.
        return valueOnVariable === valueOnNode;
      }
    } catch (e) {
      console.log('error', e);
    }
  }
  return false;
}

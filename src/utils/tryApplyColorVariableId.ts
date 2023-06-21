import { clone } from '@figma-plugin/helpers';
import { matchVariableName } from './matchVariableName';

export async function tryApplyColorVariableId(node: SceneNode, token: string, figmaVariableReferences: Record<string, string>, figmaVariableMaps: Record<string, Variable>) {
  if (Object.keys(figmaVariableMaps).length < 1) return false;
  const pathname = token.split('.').join('/');
  const matchVariableId = matchVariableName(
    token,
    pathname,
    figmaVariableReferences,
    figmaVariableMaps,
  );
  if (matchVariableId && 'fills' in node) {
    try {
      const colorVariable = figma.variables.getVariableById(matchVariableId);
      if (colorVariable) {
        const fillsCopy = clone(node.fills);
        // bind the first fill to a variable
        // when there is no fill then we make a paint manually, if not it will be failed
        fillsCopy[0] = figma.variables.setBoundVariableForPaint(fillsCopy[0], 'color', colorVariable);
        node.fills = fillsCopy;
        return node.boundVariables?.fills?.[0]?.id === colorVariable.id;
      }
    } catch (e) {
      console.log('error', e);
    }
  }
  return false;
}

import { clone } from '@figma-plugin/helpers';
import { matchVariableName } from './matchVariableName';

export enum ColorPaintType {
  FILLS = 'fills',
  STROKES = 'strokes',
}

export async function tryApplyColorVariableId(node: SceneNode, token: string, figmaVariableReferences: Record<string, string>, figmaVariableMaps: Record<string, Variable>, type: ColorPaintType) {
  const pathname = token.split('.').join('/');
  const matchVariableId = matchVariableName(
    token,
    pathname,
    figmaVariableReferences,
    figmaVariableMaps,
  );

  if (matchVariableId) {
    try {
      const colorVariable = await figma.variables.importVariableByKeyAsync(matchVariableId);
      if (colorVariable) {
        const defaultPaint: SolidPaint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
        if (type === 'fills' && 'fills' in node) {
          const fillsCopy = clone(node.fills);
          // bind the first fill to a variable
          // when there is no fill then we make a paint manually, if not it will be failed
          fillsCopy[0] = figma.variables.setBoundVariableForPaint(fillsCopy[0] ?? defaultPaint, 'color', colorVariable);
          node.fills = fillsCopy;
          return node.boundVariables?.fills?.[0]?.id === colorVariable.id;
        }
        if (type === 'strokes' && 'strokes' in node) {
          const stokesCopy = clone(node.strokes);
          stokesCopy[0] = figma.variables.setBoundVariableForPaint(stokesCopy[0] ?? defaultPaint, 'color', colorVariable);
          node.strokes = stokesCopy;
          return node.boundVariables?.strokes?.[0]?.id === colorVariable.id;
        }
      }
    } catch (e) {
      console.log('error', e);
    }
  }
  return false;
}

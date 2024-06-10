import { clone } from '@figma-plugin/helpers';
import { defaultTokenValueRetriever } from '@/plugin/TokenValueRetriever';
import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';

export enum ColorPaintType {
  FILLS = 'fills',
  STROKES = 'strokes',
  PAINTS = 'paints',
}

export async function tryApplyColorVariableId(target: BaseNode | PaintStyle, token: string, type: ColorPaintType) {
  const { applyVariablesStylesOrRawValue } = defaultTokenValueRetriever;
  const shouldApplyVariable = applyVariablesStylesOrRawValue === ApplyVariablesStylesOrRawValues.VARIABLES_STYLES;
  const isNode = !('consumers' in target);
  // First check if this is about a node or a style. If it is a node we'd need to check if we should apply variables
  if (isNode && !shouldApplyVariable) return false;

  const variable = await defaultTokenValueRetriever.getVariableReference(token);
  if (!variable) return false;

  try {
    const defaultPaint: SolidPaint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
    if (type === 'fills' && 'fills' in target) {
      const fillsCopy = clone(target.fills);
      fillsCopy[0] = figma.variables.setBoundVariableForPaint(fillsCopy[0] ?? defaultPaint, 'color', variable);
      target.fills = fillsCopy;
      return target.boundVariables?.fills?.[0]?.id === variable.id;
    }
    if (type === 'strokes' && 'strokes' in target) {
      const stokesCopy = clone(target.strokes);
      stokesCopy[0] = figma.variables.setBoundVariableForPaint(stokesCopy[0] ?? defaultPaint, 'color', variable);
      target.strokes = stokesCopy;
      return target.boundVariables?.strokes?.[0]?.id === variable.id;
    }
    // For styles we're looking for paints
    if (type === 'paints' && 'paints' in target) {
      const fillsCopy = clone(target.paints);
      fillsCopy[0] = figma.variables.setBoundVariableForPaint(fillsCopy[0] ?? defaultPaint, 'color', variable);
      target.paints = fillsCopy;
      return target.boundVariables?.paints?.[0]?.id === variable.id;
    }
  } catch (e) {
    console.log('error', e);
  }
  return false;
}

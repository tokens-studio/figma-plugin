import { clone } from '@figma-plugin/helpers';

export async function unbindVariableFromTarget(target: BaseNode | PaintStyle, key: 'paints' | 'fills' | 'strokes', newPaint: Paint) {
  if (key in target) {
    const existingPaint = target[key] !== figma.mixed ? target[key][0] : undefined;
    // Nothing bound to unbind — skip the write so we don't touch a style/node that's already correct
    if (!existingPaint?.boundVariables?.color) {
      return target[key];
    }
    const fillsCopy = clone(target[key]);
    fillsCopy[0] = figma.variables.setBoundVariableForPaint(fillsCopy[0] ?? newPaint, 'color', null);
    target[key] = fillsCopy;
    return target[key];
  }

  return target[key];
}

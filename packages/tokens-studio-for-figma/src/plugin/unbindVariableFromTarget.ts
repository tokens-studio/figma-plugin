import { clone } from '@figma-plugin/helpers';

export async function unbindVariableFromTarget(target: BaseNode | PaintStyle, key: 'paints' | 'fills' | 'strokes', newPaint: Paint) {
  if (key in target) {
    const fillsCopy = clone(target[key]);
    fillsCopy[0] = figma.variables.setBoundVariableForPaint(fillsCopy[0] ?? newPaint, 'color', null);
    target[key] = fillsCopy;
    return target[key];
  }

  return target[key];
}

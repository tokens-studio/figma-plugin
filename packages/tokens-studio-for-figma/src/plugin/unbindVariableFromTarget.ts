import { clone } from '@figma-plugin/helpers';

export async function unbindVariableFromTarget(target: BaseNode | PaintStyle, key: 'paints' | 'fills' | 'strokes', newPaint: Paint) {
  if (key === 'paints' && 'paints' in target) {
    const fillsCopy = clone(target.paints);
    fillsCopy[0] = figma.variables.setBoundVariableForPaint(fillsCopy[0] ?? newPaint, 'color', null);
    target.paints = fillsCopy;
    return target.paints;
  }
  return target;
}

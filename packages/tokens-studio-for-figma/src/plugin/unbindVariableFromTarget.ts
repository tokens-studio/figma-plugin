import { clone } from '@figma-plugin/helpers';

export async function unbindVariableFromTarget(target: BaseNode | PaintStyle, key: 'paints' | 'fills' | 'strokes') {
  if (key in target) {
    const existingPaint = target[key] !== figma.mixed ? target[key][0] : undefined;
    // Nothing bound to unbind — skip the write so we don't touch a style/node that's already correct
    if (!existingPaint?.boundVariables?.color) {
      return target[key];
    }
    const fillsCopy = clone(target[key]);
    // existingPaint (fillsCopy[0]) is guaranteed defined here — we only reach this
    // point when it already has a bound color variable to remove.
    fillsCopy[0] = figma.variables.setBoundVariableForPaint(fillsCopy[0], 'color', null);
    target[key] = fillsCopy;
    return target[key];
  }

  return target[key];
}

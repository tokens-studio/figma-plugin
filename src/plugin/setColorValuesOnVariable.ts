import { convertToFigmaColor } from './figmaTransforms/colors';
import { notifyException } from './notifiers';

export default function setColorValuesOnVariable(variable: Variable, mode: string, value: string) {
  try {
    const { color, opacity } = convertToFigmaColor(value);
    variable.setValueForMode(mode, {
      ...color,
      a: opacity,
    });
  } catch (e) {
    notifyException('Error setting colorVariable', { code: e });
    console.error('Error setting colorVariable', e);
  }
}

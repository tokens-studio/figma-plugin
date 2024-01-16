import { convertToFigmaColor } from './figmaTransforms/colors';

export default function setColorValuesOnVariable(variable: Variable, mode: string, value: string) {
  try {
    const { color, opacity } = convertToFigmaColor(value);

    variable.setValueForMode(mode, {
      ...color,
      a: opacity,
    });
  } catch (e) {
    console.error('Error setting colorVariable', e);
  }
}

import { convertToFigmaColor } from './figmaTransforms/colors';

export default function setColorValuesOnVariable(variable: Variable, mode: string, value: string) {
  try {
    const { color } = convertToFigmaColor(value);
    variable.setValueForMode(mode, color);
  } catch (e) {
    console.error('Error setting colorVariable', e);
  }
}

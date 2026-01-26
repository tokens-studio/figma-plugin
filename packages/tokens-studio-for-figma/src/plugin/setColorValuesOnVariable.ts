import { isVariableWithAliasReference } from '@/utils/isAliasReference';
import { convertToFigmaColor } from './figmaTransforms/colors';
import { isColorApproximatelyEqual } from '@/utils/isColorApproximatelyEqual';

type RGB = { r: number; g: number; b: number };
type RGBOrRGBA = RGB | RGBA;

function isFigmaColorObject(obj: VariableValue): obj is RGBOrRGBA {
  return (
    typeof obj === 'object'
    && 'r' in obj
    && 'g' in obj
    && 'b' in obj
    && typeof obj.r === 'number'
    && typeof obj.g === 'number'
    && typeof obj.b === 'number'
    && (!('a' in obj) || typeof obj.a === 'number')
  );
}

export default function setColorValuesOnVariable(variable: Variable, mode: string, value: string, forceUpdate = false) {
  try {
    const { color, opacity } = convertToFigmaColor(value);
    const existingVariableValue = variable.valuesByMode[mode];
    if (
      !existingVariableValue
      || !(isFigmaColorObject(existingVariableValue) || isVariableWithAliasReference(existingVariableValue))
    ) return;

    const newValue = { ...color, a: opacity };

    // For direct color values, compare the actual color values using threshold
    if (isFigmaColorObject(existingVariableValue)) {
      const existingValue = {
        ...existingVariableValue,
        a: 'a' in existingVariableValue ? existingVariableValue.a : 1,
      };

      if (!forceUpdate && isColorApproximatelyEqual(existingValue, newValue)) {
        // return if values are approximately equal and not forcing update
        return;
      }
    }

    variable.setValueForMode(mode, newValue);
  } catch (e) {
    console.error('Error setting colorVariable', e);
  }
}

import { isVariableWithAliasReference } from '@/utils/isAliasReference';
import { convertToFigmaColor } from './figmaTransforms/colors';

// Helper function to check if two colors are approximately equal within a threshold
function isColorApproximatelyEqual(
  color1: { r: number; g: number; b: number; a: number },
  color2: { r: number; g: number; b: number; a: number },
  threshold: number = 0.0001,
): boolean {
  return (
    Math.abs(color1.r - color2.r) < threshold
    && Math.abs(color1.g - color2.g) < threshold
    && Math.abs(color1.b - color2.b) < threshold
    && Math.abs(color1.a - color2.a) < threshold
  );
}

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

export default function setColorValuesOnVariable(variable: Variable, mode: string, value: string) {
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

      if (isColorApproximatelyEqual(existingValue, newValue)) {
        // return if values are approximately equal
        return;
      }
    }

    variable.setValueForMode(mode, newValue);
  } catch (e) {
    console.error('Error setting colorVariable', e);
  }
}

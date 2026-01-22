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

export default function setColorValuesOnVariable(variable: Variable, mode: string, value: string) {
  try {
    const { color, opacity } = convertToFigmaColor(value);
    const newValue = { ...color, a: opacity };

    // For extended collections, the mode ID format is different (e.g., "VariableCollectionId:X/Y")
    // The variable belongs to parent collection and uses parent mode IDs
    // We need to try the mode directly first, then check if it's an extended mode
    const existingVariableValue = variable.valuesByMode[mode];

    // If not found, this might be an extended collection mode - just set the value directly
    // Figma's API will handle the override correctly
    if (!existingVariableValue) {
      variable.setValueForMode(mode, newValue);
      return;
    }

    if (!(isFigmaColorObject(existingVariableValue) || isVariableWithAliasReference(existingVariableValue))) {
      return;
    }

    // For direct color values, compare the actual color values using threshold
    if (isFigmaColorObject(existingVariableValue)) {
      const existingValue = {
        ...existingVariableValue,
        a: 'a' in existingVariableValue ? existingVariableValue.a : 1,
      };

      if (isColorApproximatelyEqual(existingValue, newValue)) {
        return;
      }
    }

    variable.setValueForMode(mode, newValue);
  } catch (e) {
    console.error('Error setting colorVariable', e);
  }
}

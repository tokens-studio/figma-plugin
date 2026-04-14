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

export default function setColorValuesOnVariable(variable: Variable, mode: string, value: string, collection?: VariableCollection) {
  try {
    const { color, opacity } = convertToFigmaColor(value);
    const existingVariableValue = variable.valuesByMode[mode];

    const newValue = { ...color, a: opacity };

    // Handle extended collections: if value matches parent mode, clear override
    const modeObj = collection?.modes.find((m) => m.modeId === mode);
    const parentModeId = (modeObj as any)?.parentModeId;

    if (parentModeId) {
      const parentValue = variable.valuesByMode[parentModeId];
      if (isFigmaColorObject(parentValue)) {
        const parentColor = {
          ...parentValue,
          a: 'a' in parentValue ? parentValue.a : 1,
        };
        if (isColorApproximatelyEqual(parentColor, newValue)) {
          (variable as any).clearValueForMode(mode);
          return;
        }
      }
    }

    // Only compare if there's an existing value
    if (existingVariableValue && isFigmaColorObject(existingVariableValue)) {
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

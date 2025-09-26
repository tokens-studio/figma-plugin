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
    console.log('🎨 [DEBUG] setColorValuesOnVariable called:', { variableName: variable.name, mode, value });
    
    const { color, opacity } = convertToFigmaColor(value);
    const existingVariableValue = variable.valuesByMode[mode];
    
    console.log('🎨 [DEBUG] Color conversion result:', { color, opacity, existingVariableValue });
    
    // For new variables, existingVariableValue will be undefined - we should set the value
    if (existingVariableValue === undefined) {
      const newValue = { ...color, a: opacity };
      console.log('🎨 [DEBUG] Setting color value on new variable:', newValue);
      variable.setValueForMode(mode, newValue);
      return;
    }
    
    if (!(isFigmaColorObject(existingVariableValue) || isVariableWithAliasReference(existingVariableValue))) {
      console.warn('🎨 [DEBUG] Existing variable value is not a color or alias reference:', existingVariableValue);
      return;
    }

    const newValue = { ...color, a: opacity };

    // For direct color values, compare the actual color values using threshold
    if (isFigmaColorObject(existingVariableValue)) {
      const existingValue = {
        ...existingVariableValue,
        a: 'a' in existingVariableValue ? existingVariableValue.a : 1,
      };

      if (isColorApproximatelyEqual(existingValue, newValue)) {
        console.log('🎨 [DEBUG] Color values are approximately equal, skipping update');
        // return if values are approximately equal
        return;
      }
    }

    console.log('🎨 [DEBUG] Setting new color value:', newValue);
    variable.setValueForMode(mode, newValue);
  } catch (e) {
    console.error('❌ [DEBUG] Error setting colorVariable', e);
  }
}

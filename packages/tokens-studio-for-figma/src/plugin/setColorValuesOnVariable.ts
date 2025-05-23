import { isVariableWithAliasReference } from '@/utils/isAliasReference';
import { convertToFigmaColor } from './figmaTransforms/colors';

export function normalizeFigmaColor({
  r, g, b, a,
}: { r: number, g: number, b: number, a: number }): { r: number; g: number; b: number; a: number } {
  const roundToSixDecimals = (num: number) => Math.round(num * 1000000) / 1000000;

  return {
    r: roundToSixDecimals(r),
    g: roundToSixDecimals(g),
    b: roundToSixDecimals(b),
    a: roundToSixDecimals(a),
  };
}

function isFigmaColorObject(obj: VariableValue): obj is RGBA {
  return typeof obj === 'object' && 'r' in obj && 'g' in obj && 'b' in obj && 'a' in obj
    && typeof obj.r === 'number' && typeof obj.g === 'number' && typeof obj.b === 'number' && typeof obj.a === 'number';
}

export default function setColorValuesOnVariable(variable: Variable, mode: string, value: string) {
  try {
    const { color, opacity } = convertToFigmaColor(value);
    const existingVariableValue = variable.valuesByMode[mode];
    if (!existingVariableValue || !(isFigmaColorObject(existingVariableValue) || isVariableWithAliasReference(existingVariableValue))) return;

    const existingValue = isFigmaColorObject(existingVariableValue) ? normalizeFigmaColor(existingVariableValue) : existingVariableValue;
    const newValue = isFigmaColorObject(color) ? normalizeFigmaColor({ ...color, a: opacity }) : { ...color, a: opacity };

    if (isFigmaColorObject(existingValue) && isFigmaColorObject(newValue)) {
      if ((existingValue.r === newValue.r)
        && (existingValue.g === newValue.g)
        && (existingValue.b === newValue.b)
        && (existingValue.a === newValue.a)) {
      // return if values match
        return;
      }
    }

    variable.setValueForMode(mode, newValue);
  } catch (e) {
    console.error('Error setting colorVariable', e);
  }
}

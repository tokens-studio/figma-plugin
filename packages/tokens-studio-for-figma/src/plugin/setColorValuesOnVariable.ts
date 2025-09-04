import { isVariableWithAliasReference } from '@/utils/isAliasReference';
import { convertToFigmaColor } from './figmaTransforms/colors';
import { normalizeVariableName } from '@/utils/normalizeVariableName';

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

type RGB = { r: number; g: number; b: number };
type RGBOrRGBA = RGB | RGBA;

function isFigmaColorObject(obj: VariableValue): obj is RGBOrRGBA {
  return typeof obj === 'object' && 'r' in obj && 'g' in obj && 'b' in obj
    && typeof obj.r === 'number' && typeof obj.g === 'number' && typeof obj.b === 'number'
    && (!('a' in obj) || typeof obj.a === 'number');
}

function getReferencedVariableName(aliasValue: VariableAlias): string | null {
  try {
    const referencedVariable = figma.variables.getVariableById(aliasValue.id);
    return referencedVariable?.name || null;
  } catch (e) {
    console.error('Error getting referenced variable name:', e);
    return null;
  }
}

export default function setColorValuesOnVariable(variable: Variable, mode: string, value: string, tokenName?: string, rawValue?: string) {
  try {
    const { color, opacity } = convertToFigmaColor(value);
    const existingVariableValue = variable.valuesByMode[mode];
    if (!existingVariableValue || !(isFigmaColorObject(existingVariableValue) || isVariableWithAliasReference(existingVariableValue))) return;

    // If the existing value is an alias and we have a rawValue with reference, compare the referenced variable name
    if (isVariableWithAliasReference(existingVariableValue) && rawValue && rawValue.startsWith('{') && rawValue.endsWith('}')) {
      const referenceName = rawValue.slice(1, -1); // Remove { and }
      const referencedVariableName = getReferencedVariableName(existingVariableValue);

      if (referencedVariableName) {
        const normalizedReferencedName = normalizeVariableName(referencedVariableName);
        const normalizedReferenceName = normalizeVariableName(referenceName);

        if (normalizedReferencedName === normalizedReferenceName) {
          // The alias already points to the correct variable, no update needed
          return;
        }
      }
    }

    const newValue = normalizeFigmaColor({ ...color, a: opacity });

    // For direct color values, compare the actual color values
    if (isFigmaColorObject(existingVariableValue)) {
      const existingValue = normalizeFigmaColor({
        ...existingVariableValue,
        a: 'a' in existingVariableValue ? existingVariableValue.a : 1,
      });

      const existingA = 'a' in existingValue ? existingValue.a : 1;
      const newA = 'a' in newValue ? newValue.a : 1;
      if ((existingValue.r === newValue.r)
        && (existingValue.g === newValue.g)
        && (existingValue.b === newValue.b)
        && (existingA === newA)) {
        // return if values match
        return;
      }
    }

    console.log('Setting color value on variable', variable, variable.name, isFigmaColorObject(color), isFigmaColorObject(existingVariableValue), color, existingVariableValue);

    variable.setValueForMode(mode, newValue);
  } catch (e) {
    console.error('Error setting colorVariable', e);
  }
}

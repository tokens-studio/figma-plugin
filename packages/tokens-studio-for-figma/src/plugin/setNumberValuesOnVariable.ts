import { isVariableWithAliasReference } from '@/utils/isAliasReference';

export function normalizeNumber(num: number): number {
  return Math.trunc(num * 1000000) / 1000000;
}

export default function setNumberValuesOnVariable(variable: Variable, mode: string, value: number) {
  try {
    if (isNaN(value)) {
      throw new Error(`Skipping due to invalid value: ${value}`);
    }
    const existingVariableValue = variable.valuesByMode[mode];
    if (
      existingVariableValue === undefined
      || !(typeof existingVariableValue === 'number' || isVariableWithAliasReference(existingVariableValue))
    ) return;

    const newValue = normalizeNumber(value);

    // For direct number values, compare the normalized values
    if (typeof existingVariableValue === 'number') {
      const existingValue = normalizeNumber(existingVariableValue);
      if (existingValue === newValue) {
        // return if normalized values match
        return;
      }
    }

    console.log('Setting number value on variable', variable.name, variable.valuesByMode[mode], newValue);
    variable.setValueForMode(mode, newValue);
  } catch (e) {
    console.error('Error setting numberVariable on variable', variable.name, e);
  }
}

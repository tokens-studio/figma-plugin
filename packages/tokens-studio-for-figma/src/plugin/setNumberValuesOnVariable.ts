import { isVariableWithAliasReference } from '@/utils/isAliasReference';
import { checkVariableAliasEquality } from '@/utils/checkVariableAliasEquality';

export default function setNumberValuesOnVariable(variable: Variable, mode: string, value: number, rawValue?: string) {
  try {
    if (isNaN(value)) {
      throw new Error(`Skipping due to invalid value: ${value}`);
    }
    const existingVariableValue = variable.valuesByMode[mode];
    if (existingVariableValue === undefined || !(typeof existingVariableValue === 'number' || isVariableWithAliasReference(existingVariableValue))) return;

    // Check if the alias already points to the correct variable
    if (checkVariableAliasEquality(existingVariableValue, rawValue)) {
      // The alias already points to the correct variable, no update needed
      return;
    }

    const newValue = value;

    if (existingVariableValue !== newValue) {
      console.log('Setting number value on variable', variable.name, variable.valuesByMode[mode], newValue);
      variable.setValueForMode(mode, newValue);
    }
  } catch (e) {
    console.error('Error setting numberVariable on variable', variable.name, e);
  }
}

import { isVariableWithAliasReference } from '@/utils/isAliasReference';
import { checkVariableAliasEquality } from '@/utils/checkVariableAliasEquality';

export default function setBooleanValuesOnVariable(variable: Variable, mode: string, value: string, rawValue?: string) {
  try {
    const existingVariableValue = variable.valuesByMode[mode];
    if (existingVariableValue === undefined || !(typeof existingVariableValue === 'boolean' || isVariableWithAliasReference(existingVariableValue))) return;

    // Check if the alias already points to the correct variable
    if (checkVariableAliasEquality(existingVariableValue, rawValue)) {
      // The alias already points to the correct variable, no update needed
      return;
    }

    const newValue = value === 'true';

    if (existingVariableValue !== newValue) {
      console.log('Setting boolean value on variable', variable.name, variable.valuesByMode[mode], newValue);
      variable.setValueForMode(mode, newValue);
    }
  } catch (e) {
    console.error('Error setting booleanVariable', e);
  }
}

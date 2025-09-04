import { isVariableWithAliasReference } from '@/utils/isAliasReference';
import { checkVariableAliasEquality } from '@/utils/checkVariableAliasEquality';

export default function setStringValuesOnVariable(variable: Variable, mode: string, value: string, rawValue?: string) {
  try {
    const existingVariableValue = variable.valuesByMode[mode];
    if (!existingVariableValue || !(typeof existingVariableValue === 'string' || isVariableWithAliasReference(existingVariableValue))) return;

    // Check if the alias already points to the correct variable
    if (checkVariableAliasEquality(existingVariableValue, rawValue)) {
      // The alias already points to the correct variable, no update needed
      return;
    }

    if (existingVariableValue !== value) {
      console.log('Setting string value on variable', variable.name, variable.valuesByMode[mode], value);
      variable.setValueForMode(mode, value);
    }
  } catch (e) {
    console.error('Error setting stringVariable', e);
  }
}

import { isVariableWithAliasReference } from '@/utils/isAliasReference';

export default function setBooleanValuesOnVariable(variable: Variable, mode: string, value: string) {
  try {
    const existingVariableValue = variable.valuesByMode[mode];
    if (existingVariableValue === undefined || !(typeof existingVariableValue === 'boolean' || isVariableWithAliasReference(existingVariableValue))) return;

    const newValue = value === 'true';

    if (existingVariableValue !== newValue) {
      variable.setValueForMode(mode, newValue);
    }
  } catch (e) {
    console.error('Error setting booleanVariable', e);
  }
}

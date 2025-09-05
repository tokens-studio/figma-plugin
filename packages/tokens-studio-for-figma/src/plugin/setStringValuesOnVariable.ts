import { isVariableWithAliasReference } from '@/utils/isAliasReference';

export default function setStringValuesOnVariable(variable: Variable, mode: string, value: string) {
  try {
    const existingVariableValue = variable.valuesByMode[mode];
    if (
      !existingVariableValue
      || !(typeof existingVariableValue === 'string' || isVariableWithAliasReference(existingVariableValue))
    ) return;

    if (existingVariableValue !== value) {
      console.log('Setting string value on variable', variable.name, variable.valuesByMode[mode], value);
      variable.setValueForMode(mode, value);
    }
  } catch (e) {
    console.error('Error setting stringVariable', e);
  }
}

import { isVariableWithAliasReference } from '@/utils/isAliasReference';

export default function setStringValuesOnVariable(variable: Variable, mode: string, value: string, forceUpdate = false) {
  try {
    const existingVariableValue = variable.valuesByMode[mode];
    if (
      !existingVariableValue
      || !(typeof existingVariableValue === 'string' || isVariableWithAliasReference(existingVariableValue))
    ) return;

    if (forceUpdate || existingVariableValue !== value) {
      console.log('Setting string value on variable', variable.name, existingVariableValue, value, existingVariableValue === value ? 'match' : 'no match');
      variable.setValueForMode(mode, value);
    }
  } catch (e) {
    console.error('Error setting stringVariable', e);
  }
}

import { isVariableWithAliasReference } from '@/utils/isAliasReference';

export default function setBooleanValuesOnVariable(variable: Variable, mode: string, value: string, forceUpdate = false) {
  try {
    const existingVariableValue = variable.valuesByMode[mode];
    if (
      existingVariableValue === undefined
      || !(typeof existingVariableValue === 'boolean' || isVariableWithAliasReference(existingVariableValue))
    ) return;

    const newValue = value === 'true';

    if (forceUpdate || existingVariableValue !== newValue) {
      console.log('Setting boolean value on variable', variable.name, variable.valuesByMode[mode], newValue);
      variable.setValueForMode(mode, newValue);
    }
  } catch (e) {
    console.error('Error setting booleanVariable', e);
  }
}

import { isVariableWithAliasReference } from '@/utils/isAliasReference';

export default function setNumberValuesOnVariable(variable: Variable, mode: string, value: number) {
  try {
    if (isNaN(value)) {
      throw new Error(`Skipping due to invalid value: ${value}`);
    }
    const existingVariableValue = variable.valuesByMode[mode];
    if (
      existingVariableValue === undefined ||
      !(typeof existingVariableValue === 'number' || isVariableWithAliasReference(existingVariableValue))
    )
      return;

    const newValue = value;

    if (existingVariableValue !== newValue) {
      console.log('Setting number value on variable', variable.name, variable.valuesByMode[mode], newValue);
      variable.setValueForMode(mode, newValue);
    }
  } catch (e) {
    console.error('Error setting numberVariable on variable', variable.name, e);
  }
}

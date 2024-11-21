export default function setBooleanValuesOnVariable(variable: Variable, mode: string, value: string) {
  try {
    const existingVariableValue = variable.valuesByMode[mode];
    if (typeof existingVariableValue !== 'boolean') return;

    const existingValueString = existingVariableValue.toString();
    if (existingValueString !== value) {
      if (value === 'true') {
        variable.setValueForMode(mode, value === 'true');
      } else {
        variable.setValueForMode(mode, false);
      }
    }
  } catch (e) {
    console.error('Error setting booleanVariable', e);
  }
}

export default function setStringValuesOnVariable(variable: Variable, mode: string, value: string) {
  try {
    const existingValue = variable.valuesByMode[mode];
    if (typeof existingValue !== 'string') return;

    if (existingValue !== value) {
      variable.setValueForMode(mode, value);
    }
  } catch (e) {
    console.error('Error setting stringVariable', e);
  }
}

export default function setNumberValuesOnVariable(variable: Variable, mode: string, value: number) {
  try {
    if (isNaN(value)) {
      throw new Error(`Skipping due to invalid value: ${value}`);
    }
    const existingValue = variable.valuesByMode[mode];
    if (typeof existingValue !== 'number') return;
    if (existingValue !== value) {
      variable.setValueForMode(mode, value);
    }
  } catch (e) {
    console.error('Error setting numberVariable on variable', variable.name, e);
  }
}

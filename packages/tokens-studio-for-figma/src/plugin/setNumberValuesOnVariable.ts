export default function setNumberValuesOnVariable(variable: Variable, mode: string, value: number) {
  try {
    if (isNaN(value)) {
      throw new Error(`Skipping due to invalid value: ${value}`);
    }
    variable.setValueForMode(mode, value);
  } catch (e) {
    console.error('Error setting numberVariable', e);
  }
}

export default function setNumberValuesOnVariable(variable: Variable, mode: string, value: number) {
  try {
    variable.setValueForMode(mode, value);
  } catch (e) {
    console.error('Error setting numberVariable', e);
  }
}

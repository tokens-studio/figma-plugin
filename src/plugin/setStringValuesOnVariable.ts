export default function setStringValuesOnVariable(variable: Variable, mode: string, value: string) {
  try {
    variable.setValueForMode(mode, value);
  } catch (e) {
    console.error('Error setting stringVariable', e);
  }
}

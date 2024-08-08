export default function setNumberValuesOnVariable(variable: Variable, mode: string, value: number) {
  if (isNaN(value)) {
    console.warn('Skipping setting numberVariable due to invalid value: NaN', value);
    return;
  }

  try {
    variable.setValueForMode(mode, value);
  } catch (e) {
    console.error('Error setting numberVariable', e);
  }
}

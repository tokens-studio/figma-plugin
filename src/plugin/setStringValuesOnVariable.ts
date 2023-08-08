import { notifyException } from './notifiers';

export default function setStringValuesOnVariable(variable: Variable, mode: string, value: string) {
  try {
    variable.setValueForMode(mode, value);
  } catch (e) {
    notifyException('Error setting stringVariable', { code: e });
    console.error('Error setting stringVariable', e);
  }
}

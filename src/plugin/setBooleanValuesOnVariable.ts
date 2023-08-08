import { notifyException } from './notifiers';

export default function setBooleanValuesOnVariable(variable: Variable, mode: string, value: string) {
  try {
    if (value === 'true') {
      variable.setValueForMode(mode, true);
    } else {
      variable.setValueForMode(mode, false);
    }
  } catch (e) {
    notifyException('Error setting booleanVariable', { code: e });
    console.error('Error setting booleanVariable', e);
  }
}

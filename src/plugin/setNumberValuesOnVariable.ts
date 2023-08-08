import { notifyException } from './notifiers';

export default function setNumberValuesOnVariable(variable: Variable, mode: string, value: number) {
  try {
    variable.setValueForMode(mode, value);
  } catch (e) {
    notifyException('Error setting numberVariable', { code: e });
    console.error('Error setting numberVariable', e);
  }
}

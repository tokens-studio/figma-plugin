import { notifyException, notifyUI } from './notifiers';

export default function createVariableMode(collection: VariableCollection, mode: string) {
  try {
    return collection.addMode(mode);
  } catch (e) {
    if (e instanceof Error) {
      const limit = /Limited to (\d) modes only/.exec(e.message);
      if (limit) {
        const isMoreThanOne = limit[1].length > 1;
        notifyUI(`Your Figma plan only allows creation of ${limit[1]} ${isMoreThanOne ? 'modes' : 'mode'}`, { error: true });
      } else {
        console.error('Error', e.message, e.stack);
      }
    } else {
      notifyException('Error creating a new mode in the variable', { code: e });
      console.log(e);
    }
  }
  return '';
}

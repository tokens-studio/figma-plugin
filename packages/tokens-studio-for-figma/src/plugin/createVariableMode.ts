import { notifyUI } from './notifiers';
import { truncateModeName } from '@/utils/truncateName';

export default function createVariableMode(collection: VariableCollection, mode: string) {
  try {
    return collection.addMode(truncateModeName(mode));
  } catch (e) {
    if (e instanceof Error) {
      const limit = /Limited to (\d) modes only/.exec(e.message);
      if (limit) {
        const isMoreThanOne = Number(limit[1]) > 1;
        notifyUI(`Your Figma plan only allows creation of ${limit[1]} ${isMoreThanOne ? 'modes' : 'mode'}`, { error: true });
      } else {
        console.error('Error', e.message, e.stack);
      }
    } else {
      console.log(e);
    }
  }
  return '';
}

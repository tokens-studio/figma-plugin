import type { ItemData } from '@/context';
import type { TreeItem } from '../tokenset/tokenSetListToTree';
import { moveItem } from '../motion';

export function ensureFolderIsTogether<T extends TreeItem>(value: T, order: ItemData<T>[], nextOrder: ItemData<T>[]) {
  if (!value.isLeaf) {
    // looks like we moved a folder
    const originalIndex = order.findIndex((item) => item.value === value);
    const nextIndex = nextOrder.findIndex((item) => item.value === value);
    const delta = nextIndex - originalIndex;
    const itemsToMove = nextOrder.filter((item) => item.value.parent === value.path);
    itemsToMove.forEach((itemToMove) => {
      if (delta !== 0) {
        const itemToMoveIndex = nextOrder.findIndex((item) => item === itemToMove);
        nextOrder = moveItem(nextOrder, itemToMoveIndex, itemToMoveIndex + delta);
      }
    });
  }

  return nextOrder;
}

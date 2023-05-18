import { ItemData } from '@/context';
import { TreeItem } from './tokenSetListToTree';

export function findOrderableTargetIndexesInTokenSetTreeList<T extends TreeItem>(velocity: number, value: T, order: ItemData<T>[]) {
  const siblings = order.filter((item) => (
    item.value !== value
    && item.value.parent === value.parent
  ));
  const availableIndexes = siblings.map((item) => {
    if (velocity > 0) {
      const childrenCount = order.reduce((count, v) => (
        v.value.parent?.startsWith(item.value.path) ? count + 1 : count
      ), 0);
      return order.indexOf(item) + childrenCount;
    }
    return order.indexOf(item);
  });
  return availableIndexes;
}

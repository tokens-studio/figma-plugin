import { ItemData } from '@/context';
import { TreeItem } from '../themeListToTree';

export function findOrderableTargetIndexesInThemeList<T extends TreeItem>(velocity: number, value: T, order: ItemData<T>[]) {
  if (value.isLeaf) {
    return Array.from({ length: order.length - 1 }, (_, index) => index + 1);
  }
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

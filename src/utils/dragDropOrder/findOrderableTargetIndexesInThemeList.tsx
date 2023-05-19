import { ItemData } from '@/context';
import { TreeItem } from '../themeListToTree';

export function findOrderableTargetIndexesInThemeList<T extends TreeItem>(value: T, order: ItemData<T>[]) {
  if (value.isLeaf) {
    return order.map((item) => order.indexOf(item));
  }
  return order.filter((item) => !item.value.isLeaf).map((item) => order.indexOf(item));
}

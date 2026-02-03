import { ItemData } from '@/context';
import { TreeItem } from '../themeListToTree';

export function findOrderableTargetIndexesInThemeList<T extends TreeItem>(velocity: number, value: T, order: ItemData<T>[]) {
  if (value.isLeaf) {
    // Filter out extended themes (themes with $figmaParentThemeId) from reorder targets
    const validTargets = order.filter((item, index) => {
      // Always allow index 0 as a boundary
      if (index === 0) return true;

      // If the item is a leaf (theme), check if it's an extended theme
      if (item.value.isLeaf && typeof item.value.value === 'object') {
        // Exclude extended themes from being valid targets
        return !item.value.value.$figmaParentThemeId;
      }

      // Group headers are always valid targets
      return true;
    });

    // Return indexes of valid targets in the original order array
    return validTargets.map(item => order.indexOf(item)).filter(idx => idx > 0);
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

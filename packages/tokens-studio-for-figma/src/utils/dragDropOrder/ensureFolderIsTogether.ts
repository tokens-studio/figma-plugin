import type { ItemData } from '@/context';
import type { TreeItem } from '../tokenset/tokenSetListToTree';

export function ensureFolderIsTogether<T extends TreeItem>(value: T, order: ItemData<T>[], nextOrder: ItemData<T>[]) {
  if (!value.isLeaf) {
    // looks like we moved a folder
    const originalIndex = order.findIndex((item) => item.value === value);
    const nextIndex = nextOrder.findIndex((item) => item.value === value);

    if (originalIndex === nextIndex) return nextOrder;

    // Determine if an item is a descendant of the dragged folder (direct or nested)
    const isDescendant = (item: ItemData<T>) => (
      item.value !== value
      && item.value.parent !== null
      && (
        item.value.parent === value.path
        || item.value.parent.startsWith(`${value.path}/`)
      )
    );

    // Collect all visible descendants in their current order from nextOrder
    const descendants = nextOrder.filter(isDescendant);

    // Build a new order without the descendants
    const withoutDescendants = nextOrder.filter((item) => !isDescendant(item));

    // Find the folder's position in the list without descendants
    const folderPos = withoutDescendants.findIndex((item) => item.value === value);

    // Re-insert all descendants immediately after the folder, preserving their relative order
    return [
      ...withoutDescendants.slice(0, folderPos + 1),
      ...descendants,
      ...withoutDescendants.slice(folderPos + 1),
    ];
  }

  return nextOrder;
}

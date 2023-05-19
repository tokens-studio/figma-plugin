import { mix } from 'popmotion';
import type { ItemData } from '@/context';
import { moveItem } from './moveItem';

export function checkReorder<T>(
  order: ItemData<T>[],
  value: T,
  offset: number,
  velocity: number,
  allowedTargetIndexes: number[] = order.map((v, index) => index), // @README assume sorted array
): ItemData<T>[] {
  if (!velocity) return order;

  const index = order.findIndex((item) => item.value === value);

  if (index === -1) return order;

  const nextOffset = velocity > 0 ? 1 : -1;
  let nextIndex = index + nextOffset;

  if (!allowedTargetIndexes.includes(nextIndex)) {
    // find next closest index available
    if (velocity > 0) {
      nextIndex = allowedTargetIndexes.find((availableIndex) => availableIndex >= nextIndex) ?? -1;
    } else {
      nextIndex = [...allowedTargetIndexes].reverse().find((availableIndex) => availableIndex <= nextIndex) ?? -1;
    }
  }
  const nextItem = order[nextIndex];

  if (
    !nextItem
  ) return order;

  const item = order[index];
  const originalNextLayout = nextItem.layout;
  const nextItemCenter = mix(originalNextLayout.min, originalNextLayout.max, 0.5);
  if (
    (nextOffset === 1 && item.layout.max + offset > nextItemCenter)
          || (nextOffset === -1 && item.layout.min + offset < nextItemCenter)
  ) {
    return moveItem(order, index, nextIndex);
  }

  return order;
}

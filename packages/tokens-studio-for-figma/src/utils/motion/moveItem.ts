// Adapted from array-move / framer-motion
export function moveItem<T>([...arr]: T[], fromIndex: number, toIndex: number) {
  const startIndex = fromIndex < 0 ? arr.length + fromIndex : fromIndex;

  if (startIndex >= 0 && startIndex < arr.length) {
    const endIndex = toIndex < 0 ? arr.length + toIndex : toIndex;

    const [item] = arr.splice(fromIndex, 1);
    arr.splice(endIndex, 0, item);
  }

  return arr;
}

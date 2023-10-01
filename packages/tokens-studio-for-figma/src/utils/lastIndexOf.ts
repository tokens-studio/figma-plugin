export function lastIndexOf<T>(items: T[], cb: (item: T, index: number, self: T[]) => boolean): number {
  for (let idx = items.length - 1; idx > -1; idx -= 1) {
    if (cb(items[idx], idx, items)) {
      return idx;
    }
  }
  return -1;
}

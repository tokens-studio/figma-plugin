import type { AnyTokenList } from '@/types/tokens';

export function findParentIndexToInsertSet(currentSets: [string, AnyTokenList][], setToInsert: string) {
  const matchedLocationToInsertSet = Object.values(currentSets).reduce((acc, val, index) => {
    const parentSetPath = val[0].split('/');
    const newSetPath = setToInsert.split('/');
    const intersectionOfSets = parentSetPath.filter((value) => newSetPath.includes(value));
    if (intersectionOfSets.length > 0) {
      if (intersectionOfSets.length >= acc.matchLength) {
        acc = {
          insertAt: index,
          matchLength: intersectionOfSets.length,
        };
      }
    }
    return acc;
  }, { insertAt: currentSets.length, matchLength: 0 });

  return matchedLocationToInsertSet.insertAt;
}

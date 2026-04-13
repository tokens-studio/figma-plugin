import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { UsedTokenSetsMap } from '@/types';
import { SingleToken } from '@/types/tokens';
import { sortSets } from './sortSets';
import { normalizeTokenSetName, normalizeTokenSetStatusMap } from './normalizeTokenSetName';

export function getTokenSetsOrder(
  tokens: Record<string, SingleToken[]>,
  usedSets: UsedTokenSetsMap,
  overallConfig: UsedTokenSetsMap,
  activeTokenSet?: string,
): { tokenSetsOrder: string[]; usedSetsList: string[]; overallSets: string[]; } {
  const normalizedUsedSets = normalizeTokenSetStatusMap(usedSets);
  const normalizedOverallConfig = normalizeTokenSetStatusMap(overallConfig);
  const originalTokenSetOrder = Object.keys(tokens);
  const usedSetsList = originalTokenSetOrder.filter((key) => {
    const normalizedKey = normalizeTokenSetName(key);
    return normalizedUsedSets[normalizedKey] === TokenSetStatus.ENABLED || normalizedUsedSets[normalizedKey] === TokenSetStatus.SOURCE;
  });
  const overallSets = originalTokenSetOrder
    .filter((set) => !usedSetsList.includes(set))
    .sort((a, b) => sortSets(normalizeTokenSetName(a), normalizeTokenSetName(b), normalizedOverallConfig));

  if (activeTokenSet) {
    const normalizedActiveTokenSet = normalizeTokenSetName(activeTokenSet);
    const activeTokenSetIndex = usedSetsList.findIndex((setName) => normalizeTokenSetName(setName) === normalizedActiveTokenSet);
    if (activeTokenSetIndex > -1) {
      const [activeSet] = usedSetsList.splice(activeTokenSetIndex, 1);
      usedSetsList.push(activeSet);
    }
  }

  const tokenSetsOrder = [...overallSets, ...usedSetsList];

  return { tokenSetsOrder, usedSetsList, overallSets };
}

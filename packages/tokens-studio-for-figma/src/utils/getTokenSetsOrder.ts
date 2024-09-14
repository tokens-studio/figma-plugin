import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { UsedTokenSetsMap } from '@/types';
import { SingleToken } from '@/types/tokens';
import { sortSets } from './sortSets';

export function getTokenSetsOrder(
  tokens: Record<string, SingleToken[]>,
  usedSets: UsedTokenSetsMap,
  overallConfig: UsedTokenSetsMap,
  activeTokenSet?: string,
): { tokenSetsOrder: string[]; usedSetsList: string[]; overallSets: string[]; } {
  const originalTokenSetOrder = Object.keys(tokens);
  const usedSetsList = originalTokenSetOrder.filter((key) => usedSets[key] === TokenSetStatus.ENABLED || usedSets[key] === TokenSetStatus.SOURCE);
  const overallSets = originalTokenSetOrder
    .filter((set) => !usedSetsList.includes(set))
    .sort((a, b) => sortSets(a, b, overallConfig));

  if (activeTokenSet) {
    usedSetsList.splice(usedSetsList.indexOf(activeTokenSet), 1);
    usedSetsList.push(activeTokenSet);
  }

  const tokenSetsOrder = [...overallSets, ...usedSetsList];

  return { tokenSetsOrder, usedSetsList, overallSets };
}

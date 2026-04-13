import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { UsedTokenSetsMap } from '@/types';

const tokenSetStatusPriority: Record<TokenSetStatus, number> = {
  [TokenSetStatus.DISABLED]: 0,
  [TokenSetStatus.SOURCE]: 1,
  [TokenSetStatus.ENABLED]: 2,
};

export function normalizeTokenSetName(name: string): string {
  return name.split('/').map((part) => part.trim()).join('/');
}

export function normalizeTokenSetStatusMap(tokenSets: UsedTokenSetsMap = {}): UsedTokenSetsMap {
  return Object.entries(tokenSets).reduce((acc, [tokenSetName, status]) => {
    const normalizedTokenSetName = normalizeTokenSetName(tokenSetName);
    const currentStatus = acc[normalizedTokenSetName];
    const incomingStatus = status;

    if (!currentStatus || tokenSetStatusPriority[incomingStatus] > tokenSetStatusPriority[currentStatus]) {
      acc[normalizedTokenSetName] = status;
    }

    return acc;
  }, {} as UsedTokenSetsMap);
}

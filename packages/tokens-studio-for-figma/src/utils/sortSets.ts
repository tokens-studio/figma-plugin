import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { UsedTokenSetsMap } from '@/types';

// Helper function to sort token sets based on their status in the configuration. Basically, ENABLED and SOURCE sets are treated equally and come before DISABLED.
export function sortSets(a: string, b: string, config: UsedTokenSetsMap) {
  // Get the status of each set, defaulting to DISABLED if not found in config
  const statusA = config[a] || TokenSetStatus.DISABLED;
  const statusB = config[b] || TokenSetStatus.DISABLED;

  // If both sets have the same status, maintain their original order
  if (statusA === statusB) return 0;

  // DISABLED sets should come before ENABLED and SOURCE, which are treated equally
  if (statusA === TokenSetStatus.DISABLED && (statusB === TokenSetStatus.ENABLED || statusB === TokenSetStatus.SOURCE)) return -1;
  if ((statusA === TokenSetStatus.ENABLED || statusA === TokenSetStatus.SOURCE) && statusB === TokenSetStatus.DISABLED) return 1;

  // If we reach here, it means both are ENABLED or SOURCE, or both are DISABLED
  return 0;
}

import type { AnyTokenList } from '@/types/tokens';
import type { RemoteTokenStorageMetadata } from '@/storage/RemoteTokenStorage';

// Single source of truth for the metadata shape pushed to git-based providers.
// Both useChangedState (for the diff) and every provider's push callback (for the
// write) must produce this same shape — a mismatch causes a permanent phantom
// "$metadata changed" diff (see PR #3941).
export function buildGitMetadata(tokens: Record<string, AnyTokenList>): RemoteTokenStorageMetadata {
  return {
    tokenSetOrder: Object.keys(tokens),
  };
}

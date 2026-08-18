import type { AnyTokenList } from '@/types/tokens';
import type { RemoteTokenStorageMetadata } from '@/storage/RemoteTokenStorage';

// Single source of truth for the metadata shape pushed to git-based providers.
// Both useChangedState (for the diff) and every provider's push callback (for the
// write) must produce this same shape — a mismatch causes a permanent phantom
// "$metadata changed" diff. Note: tokenFormat deliberately does NOT live here —
// format-flip detection is driven by lastSyncedState (index 2) and the
// PushOverrides.tokenFormatChanged signal, keeping $metadata.json unchanged.
export function buildGitMetadata(tokens: Record<string, AnyTokenList>): RemoteTokenStorageMetadata {
  return {
    tokenSetOrder: Object.keys(tokens),
  };
}

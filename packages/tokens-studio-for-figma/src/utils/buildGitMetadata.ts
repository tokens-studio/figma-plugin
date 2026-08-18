import { TokenFormat, TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import type { AnyTokenList } from '@/types/tokens';
import type { RemoteTokenStorageMetadata } from '@/storage/RemoteTokenStorage';

// Single source of truth for the metadata shape pushed to git-based providers.
// Both useChangedState (for the diff) and every provider's push callback (for the
// write) must produce this same shape — a mismatch causes a permanent phantom
// "$metadata changed" diff. Providers omit `format` to read the current singleton
// value; the diff hook passes the Redux-selected format so the memo re-computes
// when the Redux state changes.
export function buildGitMetadata(
  tokens: Record<string, AnyTokenList>,
  format?: TokenFormatOptions,
): RemoteTokenStorageMetadata {
  return {
    tokenSetOrder: Object.keys(tokens),
    tokenFormat: format ?? TokenFormat.format,
  };
}

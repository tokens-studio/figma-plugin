import { StorageProviderType } from '@/constants/StorageProviderType';
import type { StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';

function apiTokenOf(credential: unknown): string {
  const apiToken = (credential as { apiToken?: unknown } | null)?.apiToken;
  return typeof apiToken === 'string' ? apiToken.trim() : '';
}

/**
 * Whether the user has a saved Bitbucket sync that uses an API token. Only API tokens were saved into files: app
 * passwords never were, and someone who only opens a file synced with Bitbucket has no token of their own to replace.
 */
export function hasBitbucketApiToken(apiProviders: StorageTypeCredentials[]): boolean {
  return (apiProviders ?? []).some((provider) => provider.provider === StorageProviderType.BITBUCKET
    && apiTokenOf(provider) !== '');
}

/**
 * Whether saving these credentials puts a Bitbucket API token in place that none of the saved syncs had: a new or
 * replaced token. Saving a sync with only its branch or path changed keeps the old token and doesn't count.
 */
export function savesNewBitbucketApiToken(
  credentials: StorageTypeFormValues<false>,
  savedProviders: StorageTypeCredentials[],
): boolean {
  const apiToken = apiTokenOf(credentials);
  if (credentials.provider !== StorageProviderType.BITBUCKET || !apiToken) return false;
  return !(savedProviders ?? []).some((provider) => provider.provider === StorageProviderType.BITBUCKET
    && apiTokenOf(provider) === apiToken);
}

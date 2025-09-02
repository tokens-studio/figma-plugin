import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageTypeCredentials } from '@/types/StorageType';

export type BitbucketCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.BITBUCKET }>;

/**
 * Determines if a Bitbucket credential is using app password (legacy) or API token
 * @param credential - The Bitbucket credential to check
 * @returns true if using app password, false if using API token
 */
export function isUsingAppPassword(credential: BitbucketCredentials): boolean {
  // If apiToken field exists and has a value, it's using API token
  if (credential.apiToken && credential.apiToken.trim() !== '') {
    return false;
  }

  // If secret exists but no apiToken, it's using app password
  if (credential.secret && credential.secret.trim() !== '') {
    return true;
  }

  // Default to false (API token) for safety
  return false;
}

/**
 * Finds all Bitbucket credentials that are still using app passwords
 * @param apiProviders - Array of all stored credentials
 * @returns Array of Bitbucket credentials using app passwords
 */
export function findAppPasswordCredentials(apiProviders: StorageTypeCredentials[]): BitbucketCredentials[] {
  return apiProviders
    .filter((provider): provider is BitbucketCredentials => provider.provider === StorageProviderType.BITBUCKET)
    .filter(isUsingAppPassword);
}

/**
 * Checks if any stored credentials are using app passwords
 * @param apiProviders - Array of all stored credentials
 * @returns true if any Bitbucket credentials are using app passwords
 */
export function hasAppPasswordCredentials(apiProviders: StorageTypeCredentials[]): boolean {
  return findAppPasswordCredentials(apiProviders).length > 0;
}

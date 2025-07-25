import { TokensStudioStorageType } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';

export interface StudioUrlOptions {
  tokenSetName?: string;
  tokenName?: string;
}

/**
 * Builds Tokens Studio URLs for projects, token sets, and individual tokens
 */
export function buildStudioUrl(
  storageConfig: TokensStudioStorageType, 
  options: StudioUrlOptions = {}
): string {
  const { baseUrl = 'https://app.prod.tokens.studio', orgId, id: projectId } = storageConfig;
  const { tokenSetName, tokenName } = options;

  // Remove trailing slash from baseUrl if present
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');

  // Base URL for the project
  const projectUrl = `${normalizedBaseUrl}/org/${orgId}/project/${projectId}`;

  // If no token set specified, return project URL
  if (!tokenSetName) {
    return projectUrl;
  }

  // Build token set URL
  const tokenSetUrl = `${projectUrl}/data/main/tokens/set/${tokenSetName}`;

  // If token name specified, add as query parameter
  if (tokenName) {
    return `${tokenSetUrl}?token=${encodeURIComponent(tokenName)}`;
  }

  return tokenSetUrl;
}

/**
 * Type guard to check if storage type is Tokens Studio
 */
export function isTokensStudioStorage(storageType: any): storageType is TokensStudioStorageType {
  return (
    storageType?.provider === StorageProviderType.TOKENS_STUDIO && 
    Boolean(storageType?.orgId) && 
    Boolean(storageType?.id)
  );
}
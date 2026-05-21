import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageType, StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';

function isSameCredentials(
  credential: StorageTypeCredentials,
  stored: StorageType | StorageTypeFormValues<false>,
): boolean {
  // If the internalId is present, we use it to check for equality
  if (stored.provider !== StorageProviderType.LOCAL && credential.internalId && stored.internalId) {
    return credential.internalId === stored.internalId;
  }

  switch (stored.provider) {
    case StorageProviderType.GITHUB:
    case StorageProviderType.GITLAB:
    case StorageProviderType.ADO:
    case StorageProviderType.BITBUCKET: {
      return (
        credential.id === stored.id
        && credential.provider === stored.provider
        && credential.filePath === stored.filePath
        && credential.branch === stored.branch
      );
    }
    case StorageProviderType.GENERIC_VERSIONED_STORAGE:
    case StorageProviderType.JSONBIN:
    case StorageProviderType.URL: {
      return credential.id === stored.id && credential.provider === stored.provider;
    }
    case StorageProviderType.SUPERNOVA:
      return (
        credential.id === stored.id
        && credential.provider === stored.provider
        && credential.designSystemUrl === stored.designSystemUrl
        && JSON.stringify(credential.mapping) === JSON.stringify(stored.mapping)
      );
    case StorageProviderType.TOKENS_STUDIO:
    case StorageProviderType.TOKENS_STUDIO_OAUTH:
      return (
        credential.id === stored.id
        && credential.provider === stored.provider
        && credential.orgId === stored.orgId
        && credential.baseUrl === stored.baseUrl
      );
    default:
      return false;
  }
}

export function isTokensStudioDuplicate(
  p1: StorageTypeCredentials,
  p2: StorageTypeCredentials,
): boolean {
  const isStudioP1 = p1.provider === StorageProviderType.TOKENS_STUDIO || p1.provider === StorageProviderType.TOKENS_STUDIO_OAUTH;
  const isStudioP2 = p2.provider === StorageProviderType.TOKENS_STUDIO || p2.provider === StorageProviderType.TOKENS_STUDIO_OAUTH;

  if (!isStudioP1 || !isStudioP2) return false;

  // Direct exact matches of ID or OrgId
  if (p1.id && p2.id && p1.id === p2.id) {
    return true;
  }
  if (p1.orgId && p2.orgId && p1.orgId === p2.orgId) {
    return true;
  }

  // Cross-version matches where one provider uses the organization ID in 'id' and the other in 'orgId'
  if (p1.id && p2.orgId && p1.id === p2.orgId) {
    return true;
  }
  if (p1.orgId && p2.id && p1.orgId === p2.id) {
    return true;
  }

  // Prefix-based matches where one of the internalIds starts with 'tokens-studio-' and matches the other's orgId, id, or internalId
  if (p1.internalId && p1.internalId.startsWith('tokens-studio-')) {
    const extractedOrgId = p1.internalId.replace('tokens-studio-', '');
    if (extractedOrgId === p2.orgId || extractedOrgId === p2.id || extractedOrgId === p2.internalId) {
      return true;
    }
  }
  if (p2.internalId && p2.internalId.startsWith('tokens-studio-')) {
    const extractedOrgId = p2.internalId.replace('tokens-studio-', '');
    if (extractedOrgId === p1.orgId || extractedOrgId === p1.id || extractedOrgId === p1.internalId) {
      return true;
    }
  }

  return false;
}

export default isSameCredentials;


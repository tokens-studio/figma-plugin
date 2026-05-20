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

export function areProvidersDuplicate(
  p1: StorageTypeCredentials,
  p2: StorageTypeCredentials,
): boolean {
  if (p1.provider !== p2.provider) {
    return false;
  }

  switch (p1.provider) {
    case StorageProviderType.GITHUB:
    case StorageProviderType.GITLAB:
    case StorageProviderType.ADO:
    case StorageProviderType.BITBUCKET: {
      const g1 = p1 as any;
      const g2 = p2 as any;
      return (
        g1.id === g2.id
        && g1.filePath === g2.filePath
        && g1.branch === g2.branch
      );
    }
    case StorageProviderType.GENERIC_VERSIONED_STORAGE:
    case StorageProviderType.JSONBIN:
    case StorageProviderType.URL: {
      const g1 = p1 as any;
      const g2 = p2 as any;
      return g1.id === g2.id;
    }
    case StorageProviderType.SUPERNOVA: {
      const g1 = p1 as any;
      const g2 = p2 as any;
      return (
        g1.id === g2.id
        && g1.designSystemUrl === g2.designSystemUrl
        && JSON.stringify(g1.mapping) === JSON.stringify(g2.mapping)
      );
    }
    case StorageProviderType.TOKENS_STUDIO:
    case StorageProviderType.TOKENS_STUDIO_OAUTH: {
      const g1 = p1 as any;
      const g2 = p2 as any;
      return (
        g1.id === g2.id
        && g1.orgId === g2.orgId
        && g1.baseUrl === g2.baseUrl
      );
    }
    default:
      return false;
  }
}

export default isSameCredentials;

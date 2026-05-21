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
    case StorageProviderType.GITHUB: {
      const g2 = p2 as typeof p1;
      return (
        p1.id === g2.id
        && p1.filePath === g2.filePath
        && p1.branch === g2.branch
        && p1.baseUrl === g2.baseUrl
      );
    }
    case StorageProviderType.GITLAB: {
      const g2 = p2 as typeof p1;
      return (
        p1.id === g2.id
        && p1.filePath === g2.filePath
        && p1.branch === g2.branch
        && p1.baseUrl === g2.baseUrl
      );
    }
    case StorageProviderType.ADO: {
      const g2 = p2 as typeof p1;
      return (
        p1.id === g2.id
        && p1.filePath === g2.filePath
        && p1.branch === g2.branch
        && p1.baseUrl === g2.baseUrl
      );
    }
    case StorageProviderType.BITBUCKET: {
      const g2 = p2 as typeof p1;
      return (
        p1.id === g2.id
        && p1.filePath === g2.filePath
        && p1.branch === g2.branch
        && p1.baseUrl === g2.baseUrl
      );
    }
    case StorageProviderType.GENERIC_VERSIONED_STORAGE: {
      const g2 = p2 as typeof p1;
      return p1.id === g2.id && p1.flow === g2.flow;
    }
    case StorageProviderType.JSONBIN: {
      const g2 = p2 as typeof p1;
      return p1.id === g2.id;
    }
    case StorageProviderType.URL: {
      const g2 = p2 as typeof p1;
      return p1.id === g2.id;
    }
    case StorageProviderType.SUPERNOVA: {
      const g2 = p2 as typeof p1;
      return (
        p1.id === g2.id
        && p1.designSystemUrl === g2.designSystemUrl
        && JSON.stringify(p1.mapping) === JSON.stringify(g2.mapping)
      );
    }
    case StorageProviderType.TOKENS_STUDIO:
    case StorageProviderType.TOKENS_STUDIO_OAUTH: {
      const g2 = p2 as typeof p1;
      return (
        p1.id === g2.id
        && p1.orgId === g2.orgId
        && p1.baseUrl === g2.baseUrl
      );
    }
    default:
      return false;
  }
}

export default isSameCredentials;

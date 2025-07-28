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

export default isSameCredentials;

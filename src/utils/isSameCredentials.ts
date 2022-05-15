import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageType, StorageTypeCredentials } from '@/types/StorageType';

function isSameCredentials(credential: StorageTypeCredentials, stored: StorageType): boolean {
  switch (stored.provider) {
    case StorageProviderType.GITHUB:
    case StorageProviderType.GITLAB:
    case StorageProviderType.ADO: {
      return (
        credential.id === stored.id
        && credential.provider === stored.provider
        && credential.filePath === stored.filePath
        && credential.branch === stored.branch
      );
    }
    case StorageProviderType.JSONBIN:
    case StorageProviderType.URL: {
      return credential.id === stored.id && credential.provider === stored.provider;
    }
    default:
      return true;
  }
}

export default isSameCredentials;

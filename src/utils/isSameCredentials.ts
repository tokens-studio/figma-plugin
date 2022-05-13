import { ContextObject, StorageProviderType, StorageType } from '@/types/api';

function isSameCredentials(credential: ContextObject, stored: StorageType): boolean {
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
    default: {
      return credential.id === stored.id && credential.provider === stored.provider;
    }
  }
}

export default isSameCredentials;

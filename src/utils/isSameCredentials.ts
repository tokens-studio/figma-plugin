import { ContextObject, StorageProviderType, StoredCredentials } from '@/types/api';

function isSameCredentials(credential: ContextObject, stored: StoredCredentials): boolean {
  switch (stored.provider) {
    case StorageProviderType.GITHUB: {
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

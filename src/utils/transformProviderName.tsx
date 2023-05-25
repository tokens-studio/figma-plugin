import { StorageProviderType } from '@/constants/StorageProviderType';

export const transformProviderName = (provider: StorageProviderType) => {
  switch (provider) {
    case StorageProviderType.JSONBIN:
      return 'JSONBin.io';
    case StorageProviderType.GITHUB:
      return 'GitHub';
    case StorageProviderType.GITLAB:
      return 'GitLab';
    case StorageProviderType.BITBUCKET:
      return 'Bitbucket';
    case StorageProviderType.ADO:
      return 'ADO';
    case StorageProviderType.URL:
      return 'URL';
    case StorageProviderType.SUPERNOVA:
      return 'Supernova';
    default:
      return provider;
  }
};

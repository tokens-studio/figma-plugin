import { StorageProviderType } from '@sync-providers/types';
import { getProviderIcon } from './getProviderIcon';

export const getHeaderText = (storageProvider: StorageProviderType) => {
  const icon = getProviderIcon(storageProvider);
  const providerText = {
    url: 'a server URL',
    jsonbin: 'JSONBIN',
    github: 'GitHub',
    gitlab: 'GitLab',
    ado: 'Azure DevOps',
    bitbucket: 'Bitbucket',
    supernova: 'Supernova',
    genericVersionedStorage: 'Generic Versioned Storage',
    tokensstudio: 'Tokens Studio',
  }[storageProvider] || storageProvider;
  return { icon, text: `Sync to ${providerText}` };
};

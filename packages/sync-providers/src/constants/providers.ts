import { StorageProviderType } from '../types/StorageProviders';

export const AVAILABLE_PROVIDERS: Record<string, StorageProviderType> = Object.keys(StorageProviderType)
  .reduce((acc, provider) => {
    acc = {
      ...acc,
      [provider]: StorageProviderType[provider],
    };
    return acc;
  }, {});

export const LIST_OF_PROVIDERS = [
  {
    text: 'providers.url.title',
    i18n: true,
    type: AVAILABLE_PROVIDERS.URL,
  },
  {
    text: 'providers.jsonbin.title',
    i18n: true,
    type: AVAILABLE_PROVIDERS.JSONBIN,
  },
  {
    text: 'GitHub',
    type: AVAILABLE_PROVIDERS.GITHUB,
  },
  {
    text: 'GitLab',
    type: AVAILABLE_PROVIDERS.GITLAB,
  },
  {
    text: 'Azure DevOps',
    type: AVAILABLE_PROVIDERS.ADO,
  },
  {
    text: 'BitBucket',
    type: AVAILABLE_PROVIDERS.BITBUCKET,
    beta: true,
  },
  {
    text: 'Supernova',
    type: AVAILABLE_PROVIDERS.SUPERNOVA,
  },
  {
    text: 'providers.generic.title',
    i18n: true,
    type: AVAILABLE_PROVIDERS.GENERIC_VERSIONED_STORAGE,
  },
  {
    text: 'Tokens Studio',
    type: AVAILABLE_PROVIDERS.TOKENS_STUDIO,
    beta: true,
  },
];

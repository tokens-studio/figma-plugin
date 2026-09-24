import { StorageProviderType } from './StorageProviderType';

const syncProviders: Record<Exclude<StorageProviderType, StorageProviderType.LOCAL>, string> = {
  [StorageProviderType.GITHUB]: 'https://docs.tokens.studio/token-storage/remote/sync-git-github',
  [StorageProviderType.GITLAB]: 'https://docs.tokens.studio/token-storage/remote/sync-git-gitlab',
  [StorageProviderType.BITBUCKET]: 'https://docs.tokens.studio/token-storage/remote/sync-git-bitbucket',
  [StorageProviderType.ADO]: 'https://docs.tokens.studio/token-storage/remote/sync-git-azure-devops',
  [StorageProviderType.JSONBIN]: 'https://docs.tokens.studio/token-storage/remote/sync-cloud-jsonbin',
  [StorageProviderType.SUPERNOVA]: 'https://docs.tokens.studio/token-storage/remote/sync-cloud-supernova',
  [StorageProviderType.TOKENS_STUDIO_OAUTH]: 'https://docs.tokens.studio/token-storage/remote/sync-cloud-studio-platform',
  [StorageProviderType.URL]: 'https://docs.tokens.studio/token-storage/remote/sync-server-url',
  [StorageProviderType.GENERIC_VERSIONED_STORAGE]: 'https://docs.tokens.studio/token-storage/remote/sync-server-generic',
};

export const docUrls = {
  root: 'https://docs.tokens.studio/',
  installPlugin: 'https://docs.tokens.studio/get-started/install-figma-plugin',
  tokenTypes: 'https://docs.tokens.studio/manage-tokens/token-types/',
  tokenReferences: 'https://docs.tokens.studio/manage-tokens/token-values/references',
  tokenSets: 'https://docs.tokens.studio/manage-tokens/token-sets',
  tokenFormat: 'https://docs.tokens.studio/manage-settings/token-format',
  variablesOverview: 'https://docs.tokens.studio/figma/variables-overview',
  inspectTokens: 'https://docs.tokens.studio/debug/inspect-tokens',
  remoteStorage: 'https://docs.tokens.studio/token-storage/remote',
  figmaDataLimit: 'https://docs.tokens.studio/token-storage/local/figma-data-limit',
  generateDocumentation: 'https://docs.tokens.studio/figma/generate-documentation',
  exportToFigma: 'https://docs.tokens.studio/figma/export/',
  exportThemes: 'https://docs.tokens.studio/figma/export/themes',
  exportTokenSets: 'https://docs.tokens.studio/figma/export/token-sets',
  bitbucketAppPasswordMigration: 'https://docs.tokens.studio/token-storage/remote/sync-git-bitbucket/migration-from-app-passwords-to-api-tokens',
  syncProviders,
};

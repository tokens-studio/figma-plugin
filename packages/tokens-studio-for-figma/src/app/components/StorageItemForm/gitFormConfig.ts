import { StorageProviderType } from '@/constants/StorageProviderType';

export type GitFormProvider = StorageProviderType.GITHUB | StorageProviderType.GITLAB | StorageProviderType.GITEA;

type GitFormConfig = {
  descriptionKey: string;
  readMoreKey: string;
  documentationUrl?: string;
  setupNoteKey?: string;
  tokenHelpKey?: string;
  baseUrl: {
    labelKey: string;
    helpKey: string;
    placeholder: string;
    required: boolean;
  };
};

export const gitFormConfig: Record<GitFormProvider, GitFormConfig> = {
  [StorageProviderType.GITHUB]: {
    descriptionKey: 'gitHubExplained',
    readMoreKey: 'readMoreGitHub',
    baseUrl: {
      labelKey: 'baseUrl',
      helpKey: 'baseUrlHelpText',
      placeholder: 'https://github.hyma.com',
      required: false,
    },
  },
  [StorageProviderType.GITLAB]: {
    descriptionKey: 'gitLabExplained',
    readMoreKey: 'readMoreGitLab',
    baseUrl: {
      labelKey: 'baseUrl',
      helpKey: 'baseUrlHelpText',
      placeholder: 'https://gitlab.hyma.com',
      required: false,
    },
  },
  [StorageProviderType.GITEA]: {
    descriptionKey: 'providers.gitea.description',
    readMoreKey: 'providers.gitea.readMore',
    documentationUrl: 'https://docs.tokens.studio/token-storage/remote/sync-git-gitea?ref=addprovider',
    setupNoteKey: 'providers.gitea.cors',
    tokenHelpKey: 'providers.gitea.tokenHelp',
    baseUrl: {
      labelKey: 'providers.gitea.serverUrl',
      helpKey: 'providers.gitea.serverHelp',
      placeholder: 'https://git.example.com/gitea',
      required: true,
    },
  },
};

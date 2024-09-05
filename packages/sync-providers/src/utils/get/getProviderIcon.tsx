import React from 'react';
import { ArchiveIcon, GitHubLogoIcon, Link2Icon } from '@radix-ui/react-icons';
import { AVAILABLE_PROVIDERS } from '../../constants';
import {
  IconAzure, IconBitbucket, IconFile, IconGitlab, IconJsonBin, IconSupernova, IconTokensStudio,
} from '../../icons';

export function getProviderIcon(provider: keyof typeof AVAILABLE_PROVIDERS) {
  switch (provider) {
    case AVAILABLE_PROVIDERS.LOCAL:
      return <IconFile />;
    case AVAILABLE_PROVIDERS.URL:
      return <Link2Icon />;
    case AVAILABLE_PROVIDERS.GITHUB:
      return <GitHubLogoIcon />;
    case AVAILABLE_PROVIDERS.GITLAB:
      return <IconGitlab />;
    case AVAILABLE_PROVIDERS.ADO:
      return <IconAzure />;
    case AVAILABLE_PROVIDERS.BITBUCKET:
      return <IconBitbucket />;
    case AVAILABLE_PROVIDERS.JSONBIN:
      return <IconJsonBin />;
    case AVAILABLE_PROVIDERS.SUPERNOVA:
      return <IconSupernova />;
    case AVAILABLE_PROVIDERS.GENERIC_VERSIONED_STORAGE:
      return <ArchiveIcon />;
    case AVAILABLE_PROVIDERS.TOKENS_STUDIO:
      return <IconTokensStudio />;
    default:
      return null;
  }
}

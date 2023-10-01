import React from 'react';
import { ArchiveIcon, GitHubLogoIcon, Link2Icon } from '@radix-ui/react-icons';
import { IconFile } from '@/icons';
import GitLabIcon from '@/icons/gitlab.svg';
import ADOIcon from '@/icons/azure.svg';
import JSONBinIcon from '@/icons/jsonbin.svg';
import SupernovaIcon from '@/icons/supernova.svg';
import { StorageProviderType } from '@/constants/StorageProviderType';

export function getProviderIcon(provider: StorageProviderType) {
  switch (provider) {
    case StorageProviderType.LOCAL:
      return <IconFile />;
    case StorageProviderType.URL:
      return <Link2Icon />;
    case StorageProviderType.GITHUB:
      return <GitHubLogoIcon />;
    case StorageProviderType.GITLAB:
      return <GitLabIcon />;
    case StorageProviderType.ADO:
      return <ADOIcon />;
    case StorageProviderType.BITBUCKET:
      return <Link2Icon />;
    case StorageProviderType.JSONBIN:
      return <JSONBinIcon />;
    case StorageProviderType.SUPERNOVA:
      return <SupernovaIcon />;
    case StorageProviderType.GENERIC_VERSIONED_STORAGE:
      return <ArchiveIcon />;
    default:
      return null;
  }
}

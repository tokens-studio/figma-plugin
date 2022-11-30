import React from 'react';
import { IconFile, IconGithub } from '@/icons';
import { StorageProviderType } from '@/constants/StorageProviderType';

export function getProviderIcon(provider: StorageProviderType) {
  switch (provider) {
    case StorageProviderType.LOCAL:
      return <IconFile />;
    case StorageProviderType.URL:
      return <IconGithub />;
    case StorageProviderType.GITHUB:
      return <IconGithub />;
    case StorageProviderType.GITLAB:
      return <IconGithub />;
    case StorageProviderType.ADO:
      return <IconGithub />;
    case StorageProviderType.BITBUCKET:
      return <IconGithub />;
    case StorageProviderType.JSONBIN:
      return <IconGithub />;
    default:
      return null;
  }
}

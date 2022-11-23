/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { useSelector } from 'react-redux';
import isSameCredentials from '@/utils/isSameCredentials';
import Button from './Button';
import useRemoteTokens from '../store/remoteTokens';
import { storageTypeSelector } from '@/selectors';
import { StyledStorageItem } from './StyledStorageItem';
import type { StorageTypeCredentials } from '@/types/StorageType';
import { isGitProvider } from '@/utils/is';
import Box from './Box';
import useConfirm from '../hooks/useConfirm';
import { DotaVertical, IconGithub } from '@/icons';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItemIndicator,
  DropdownMenuSeparator,
} from './DropdownMenu';
import { StorageProviderType } from '@/constants/StorageProviderType';

type Props = {
  item: StorageTypeCredentials;
  onEdit: () => void;
};

const StorageItem = ({ item, onEdit }: Props) => {
  const storageType = useSelector(storageTypeSelector);
  const { provider, id, name } = item;

  const branch = isGitProvider(item) ? item.branch : null;

  const { restoreStoredProvider, deleteProvider } = useRemoteTokens();
  const { confirm } = useConfirm();

  const askUserIfDelete = React.useCallback(async () => {
    const shouldDelete = await confirm({
      text: 'Do you really want to delete this sync setting?',
    });
    return shouldDelete;
  }, [confirm]);

  const isActive = React.useCallback(() => isSameCredentials(item, storageType), [item, storageType]);
  const handleDelete = React.useCallback(async () => {
    if (await askUserIfDelete()) deleteProvider(item);
  }, [deleteProvider, item, askUserIfDelete]);

  const handleRestore = React.useCallback(() => {
    restoreStoredProvider(item);
  }, [item, restoreStoredProvider]);

  const getProviderIcon = React.useCallback(() => {
    switch (provider) {
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
  }, [provider]);

  return (
    <StyledStorageItem
      data-cy={`storageitem-${provider}-${id}`}
      key={`${provider}-${id}`}
      active={isActive()}
    >
      <Box css={{
        alignItems: 'flex-start', flexDirection: 'column', flexGrow: '1', display: 'flex', overflow: 'hidden',
      }}
      >
        { getProviderIcon() }
        <Box css={{ fontSize: '$small', fontWeight: '$bold' }}>{name}</Box>
        <Box css={{
          whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', opacity: '0.75', fontSize: '$xsmall', maxWidth: '100%',
        }}
        >
          {id}
          {' '}
          {branch && ` (${branch})`}
        </Box>
      </Box>
      <div className="flex items-center space-x-2 flex-nowrap">
        {!isActive() && (
          <Button id="button-storageitem-apply" variant="secondary" onClick={handleRestore}>
            {isActive() ? 'Active' : 'Apply'}
          </Button>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <DotaVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem textValue="Edit" onSelect={onEdit}>Edit</DropdownMenuItem>
          <DropdownMenuItem textValue="Delete" onSelect={handleDelete}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </StyledStorageItem>
  );
};

export default StorageItem;

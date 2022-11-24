import React from 'react';
import { useSelector } from 'react-redux';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import isSameCredentials from '@/utils/isSameCredentials';
import Button from './Button';
import useRemoteTokens from '../store/remoteTokens';
import { storageTypeSelector } from '@/selectors';
import { StyledStorageItem } from './StyledStorageItem';
import type { StorageTypeCredentials } from '@/types/StorageType';
import { isGitProvider } from '@/utils/is';
import Box from './Box';
import useConfirm from '../hooks/useConfirm';
import { IconDotaVertical } from '@/icons';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from './DropdownMenu';
import { getProviderIcon } from '@/utils/getProviderIcon';

type Props = {
  item: StorageTypeCredentials;
  onEdit: () => void;
};

const StorageItem = ({ item, onEdit }: Props) => {
  const [hasErrored, setHasErrored] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>();
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

  const handleRestore = React.useCallback(async () => {
    const response = await restoreStoredProvider(item);
    if (response.status === 'success') {
      setHasErrored(false);
    } else {
      setHasErrored(true);
      setErrorMessage(response?.errorMessage);
    }
  }, [item, restoreStoredProvider]);

  return (
    <StyledStorageItem
      data-cy={`storageitem-${provider}-${id}`}
      css={{ alignItems: 'center' }}
      key={`${provider}-${id}`}
      active={isActive()}
    >
      <Box css={{
        alignItems: 'flex-start', flexDirection: 'column', flexGrow: '1', display: 'flex', overflow: 'hidden', gap: '$3',
      }}
      >
        <Box css={{
          alignItems: 'flex-start', flexDirection: 'row', flexGrow: '1', display: 'flex', overflow: 'hidden', gap: '$3',
        }}
        >
          <Box>
            { getProviderIcon(provider) }
          </Box>
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
        <Box>
          {hasErrored && isActive() && (
          <Box css={{ display: 'flex', color: '$fgDanger' }}>
            <Box css={{ marginRight: '$3' }}>
              <ExclamationTriangleIcon />
            </Box>
            {errorMessage}
          </Box>
          )}
        </Box>
      </Box>
      <Box css={{ marginRight: '$3' }}>
        <Button id="button-storage-item-apply" variant={isActive() ? 'primary' : 'secondary'} onClick={handleRestore}>
          {isActive() ? 'Active' : 'Apply'}
        </Button>
      </Box>
      <DropdownMenu>
        <DropdownMenuTrigger css={{ padding: '$1', background: 'none' }}>
          <IconDotaVertical />
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

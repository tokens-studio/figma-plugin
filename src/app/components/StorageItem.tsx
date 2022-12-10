import React from 'react';
import { useSelector } from 'react-redux';
import { DotsVerticalIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import isSameCredentials from '@/utils/isSameCredentials';
import Button from './Button';
import useRemoteTokens from '../store/remoteTokens';
import { storageTypeSelector } from '@/selectors';
import { StyledStorageItem } from './StyledStorageItem';
import type { StorageTypeCredentials } from '@/types/StorageType';
import { isGitProvider } from '@/utils/is';
import Box from './Box';
import useConfirm from '../hooks/useConfirm';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from './DropdownMenu';
import { getProviderIcon } from '@/utils/getProviderIcon';
import Stack from './Stack';
import Badge from './Badge';

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
      text: 'Do you really want to delete this?',
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
      key={`${provider}-${id}`}
      active={isActive()}
    >
      <Stack
        direction="column"
        gap={1}
        css={{
          flexGrow: '1', overflow: 'hidden',
        }}
      >
        <Stack
          direction="row"
          gap={3}
          css={{
            flexGrow: '1', overflow: 'hidden', maxWidth: 'stretch',
          }}
        >
          <Box css={{ color: '$fgDefault' }}>
            { getProviderIcon(provider) }
          </Box>
          <Stack direction="column" gap={0} css={{ overflow: 'hidden' }}>
            <Box css={{
              textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '$small', fontWeight: '$bold',
            }}
            >
              {name}
            </Box>
            <Box css={{
              whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', opacity: '0.75', fontSize: '$xsmall', maxWidth: '100%',
            }}
            >
              {id}
              {' '}
              {branch && ` (${branch})`}
            </Box>
          </Stack>
        </Stack>
        {hasErrored && isActive() && (
          <Box
            css={{
              display: 'flex', flexDirection: 'row', color: '$fgDanger', gap: '$3', marginTop: '$3',
            }}
            data-testid="error-message"
          >
            <ExclamationTriangleIcon />
            {errorMessage}
          </Box>
        )}
      </Stack>
      <Box css={{ marginRight: '$3' }}>
        {isActive() ? <Badge text="Active" /> : (
          <Button id="button-storage-item-apply" variant="secondary" onClick={handleRestore}>
            Apply
          </Button>
        )}
      </Box>
      <DropdownMenu>
        <DropdownMenuTrigger css={{ padding: '$2', borderRadius: '$button', background: 'none' }} data-testid="storage-item-tools-dropdown">
          <DotsVerticalIcon />
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

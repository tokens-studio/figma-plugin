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

type Props = {
  item: StorageTypeCredentials,
  onEdit: () => void
};

const StorageItem = ({ item, onEdit }: Props) => {
  const storageType = useSelector(storageTypeSelector);
  const {
    provider, id, name,
  } = item;

  const branch = isGitProvider(item) ? item.branch : null;

  const { restoreStoredProvider, deleteProvider } = useRemoteTokens();

  const isActive = React.useCallback(() => (
    isSameCredentials(item, storageType)
  ), [item, storageType]);

  const handleDelete = React.useCallback(() => {
    deleteProvider(item);
  }, [deleteProvider, item]);

  const handleRestore = React.useCallback(() => {
    restoreStoredProvider(item);
  }, [item, restoreStoredProvider]);

  return (
    <StyledStorageItem
      data-cy={`storageitem-${provider}-${id}`}
      key={`${provider}-${id}`}
      active={isActive()}
    >
      <Box css={{
        alignItems: 'flex-start', flexDirection: 'column', flexGrow: '1', display: 'flex', width: '80%',
      }}
      >
        <Box css={{ fontSize: '$small', fontWeight: '$bold' }}>{name}</Box>
        <Box css={{
          whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', opacity: '0.75', fontSize: '$xsmall', maxWidth: '100%',
        }}
        >
          {id}
          {' '}
          {branch && ` (${branch})`}
        </Box>
        {!isActive() && (
          <button
            type="button"
            className="inline-flex text-left text-red-600 underline text-xxs"
            onClick={handleDelete}
          >
            Delete local credentials
          </button>
        )}
      </Box>
      <div className="space-x-2 flex-nowrap flex items-center">
        {onEdit && (
          <Button id="button-storageitem-edit" variant="secondary" onClick={onEdit}>
            Edit
          </Button>
        )}
        {!isActive() && (
          <Button
            id="button-storageitem-apply"
            variant="secondary"
            onClick={handleRestore}
          >
            Apply
          </Button>
        )}
      </div>
    </StyledStorageItem>
  );
};

export default StorageItem;

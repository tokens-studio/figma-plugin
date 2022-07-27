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
import useConfirm from '../hooks/useConfirm';

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
  const { confirm } = useConfirm();

  const askUserIfDelete = React.useCallback(async () => {
    const shouldDelete = await confirm({
      text: 'Do you really want to delete this sync setting?',
    });
    return shouldDelete;
  }, [confirm]);

  const isActive = React.useCallback(() => (
    isSameCredentials(item, storageType)
  ), [item, storageType]);

  const handleDelete = React.useCallback(async () => {
    if (await askUserIfDelete()) deleteProvider(item);
  }, [deleteProvider, item, askUserIfDelete]);

  const handleRestore = React.useCallback(() => {
    restoreStoredProvider(item);
  }, [item, restoreStoredProvider]);

  return (
    <StyledStorageItem
      data-cy={`storageitem-${provider}-${id}`}
      key={`${provider}-${id}`}
      active={isActive()}

    >
      <div className="flex flex-col grow items-start">
        <div className="text-xs font-bold">{name}</div>
        <div className="opacity-75 text-xxs">
          {id}
          {' '}
          {branch && ` (${branch})`}
        </div>
        <button
          type="button"
          className="inline-flex text-left text-red-600 underline text-xxs"
          onClick={handleDelete}
        >
          Delete local credentials
        </button>
      </div>
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

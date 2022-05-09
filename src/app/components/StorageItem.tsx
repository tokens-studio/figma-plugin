/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { useSelector } from 'react-redux';
import isSameCredentials from '@/utils/isSameCredentials';
import Button from './Button';
import useRemoteTokens from '../store/remoteTokens';
import { storageTypeSelector } from '@/selectors';
import { StyledStorageItem } from './StyledStorageItem';
import { ApiDataType } from '@/types/api';

// @TODO typings

type Props = {
  item: ApiDataType,
  onEdit?: () => void
};

const StorageItem = ({ item, onEdit = null }: Props) => {
  const storageType = useSelector(storageTypeSelector);
  const {
    provider, id, branch, name,
  } = item;

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
      <div className="flex flex-col grow items-start">
        <div className="text-xs font-bold">{name}</div>
        <div className="opacity-75 text-xxs">
          {id}
          {' '}
          {branch && ` (${branch})`}
        </div>
        {!isActive() && (
        <button
          type="button"
          className="inline-flex text-left text-red-600 underline text-xxs"
          onClick={handleDelete}
        >
          Delete local credentials
        </button>
        )}
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

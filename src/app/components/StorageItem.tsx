/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { useSelector } from 'react-redux';
import isSameCredentials from '@/utils/isSameCredentials';
import Button from './Button';
import useRemoteTokens from '../store/remoteTokens';
import { storageTypeSelector } from '@/selectors';

// @TODO typings

const StorageItem = ({ item, onEdit = null }) => {
  const storageType = useSelector(storageTypeSelector);
  const {
    provider, id, branch, name,
  } = item;

  const { restoreStoredProvider, deleteProvider } = useRemoteTokens();

  const isActive = React.useCallback(() => (
    isSameCredentials(item, storageType)
  ), [item, storageType]);

  return (
    <div
      data-cy={`storageitem-${provider}-${id}`}
      key={`${provider}-${id}`}
      className={`border text-left flex flex-row justify-between rounded p-2 ${
        isActive() ? 'bg-blue-100 bg-opacity-50 border-blue-400' : 'hover:border-blue-300 border-gray-300'
      }`}
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
          onClick={() => deleteProvider(item)}
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
          onClick={() => restoreStoredProvider(item)}
        >
          Apply
        </Button>
        )}
      </div>
    </div>
  );
};

export default StorageItem;

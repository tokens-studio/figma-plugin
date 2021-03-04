/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from 'react';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';
import {postToFigma} from '../../plugin/notifiers';
import {MessageToPluginTypes} from '../../types/messages';
import Button from './Button';

const StorageItem = ({provider, id, secret, name, handleSync, onEdit = null}) => {
    const {storageType} = useTokenState();
    const {setLocalApiState} = useTokenDispatch();

    const restoreStoredProvider = () => {
        console.log('restoring stored provider', provider, id, secret, name);
        setLocalApiState({provider, id, secret, name});
        handleSync({provider, id, secret, name});
    };

    const deleteProvider = () => {
        postToFigma({
            type: MessageToPluginTypes.REMOVE_SINGLE_CREDENTIAL,
            id,
            secret,
        });
    };

    const isActive = () => {
        return storageType.id === id && storageType.provider === provider;
    };

    return (
        <div
            key={`${provider}-${id}`}
            className={`border text-left flex flex-row justify-between rounded p-2 ${
                isActive() ? 'bg-blue-100 bg-opacity-50 border-blue-400' : 'hover:border-blue-300 border-gray-300'
            }`}
        >
            <div className="flex flex-col flex-grow items-start">
                <div className="text-xs font-bold">{name}</div>
                <div className="opacity-75 text-xxs">{id}</div>
                {!isActive() && (
                    <button
                        type="button"
                        className="inline-flex text-left text-red-600 underline text-xxs"
                        onClick={() => deleteProvider()}
                    >
                        Delete local credentials
                    </button>
                )}
            </div>
            <div className="space-x-2">
                {onEdit && (
                    <Button variant="secondary" onClick={onEdit}>
                        Edit
                    </Button>
                )}
                <Button variant="secondary" disabled={isActive()} onClick={() => restoreStoredProvider()}>
                    Apply
                </Button>
            </div>
        </div>
    );
};

export default StorageItem;

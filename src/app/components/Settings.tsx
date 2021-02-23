/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from 'react';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';
import {StorageProviderType} from '../../types/api';
import Button from './Button';
import Input from './Input';
import {createNewBin, fetchDataFromRemote} from '../store/remoteTokens';
import Heading from './Heading';
import TokenData from './TokenData';
import {postToFigma} from '../../plugin/notifiers';
import {MessageToPluginTypes} from '../../types/messages';
import {compareUpdatedAt} from './utils';

const Settings = () => {
    const {tokenData, storageType, localApiState, apiProviders, updateAfterApply, usedTokenSet} = useTokenState();
    const {
        setLoading,
        setLocalApiState,
        setApiData,
        setStorageType,
        setTokenData,
        toggleUpdateAfterApply,
        updateTokens,
    } = useTokenDispatch();

    const isActive = (provider, id) => {
        return storageType.id === id && storageType.provider === provider;
    };

    const handleChange = (e) => {
        setLocalApiState({...localApiState, [e.target.name]: e.target.value});
    };

    const handleCreateNewClick = async (provider) => {
        setApiData({secret: localApiState.secret, provider, name: localApiState.name});
        createNewBin({
            provider,
            secret: localApiState.secret,
            tokens: tokenData.reduceToValues(),
            name: localApiState.name,
            updatedAt: tokenData.getUpdatedAt(),
            setApiData,
            setStorageType,
        });
    };

    const handleSyncClick = async ({
        id = localApiState.id,
        secret = localApiState.secret,
        name = localApiState.name,
        provider,
    }) => {
        setLoading(true);
        setStorageType({provider, id, name}, true);
        setApiData({id, secret, name, provider});
        const remoteTokens = await fetchDataFromRemote(id, secret, name, provider);
        console.log('syncing', remoteTokens);
        if (remoteTokens) {
            const comparison = await compareUpdatedAt(tokenData.getUpdatedAt(), remoteTokens);
            if (comparison === 'remote_older') {
                console.log(
                    'Remote is older, ask user if they want to overwrite their local progress or upload to remote.'
                );
                setTokenData(new TokenData(remoteTokens, Object.keys(remoteTokens.values)), remoteTokens.updatedAt);
                if (updateAfterApply) {
                    console.log('should update!', remoteTokens);
                    updateTokens(false);
                }
            } else {
                setTokenData(new TokenData(remoteTokens, Object.keys(remoteTokens.values)), remoteTokens.updatedAt);
                if (updateAfterApply) {
                    console.log('should update!', remoteTokens);
                    updateTokens(false);
                }
            }
        }
        setLoading(false);
    };

    React.useEffect(() => {
        console.log('localapistate', localApiState);
    }, []);

    const restoreStoredProvider = (provider) => {
        setLocalApiState(provider);
        handleSyncClick(provider);
    };

    const deleteProvider = ({id, secret}) => {
        postToFigma({
            type: MessageToPluginTypes.REMOVE_SINGLE_CREDENTIAL,
            id,
            secret,
        });
    };

    return (
        <div className="flex flex-col flex-grow">
            <div className="border-b p-4 space-y-4">
                <div className="space-y-4">
                    <Heading>Token Storage</Heading>
                    <div className="flex flex-row gap-2">
                        <button
                            className={`font-bold focus:outline-none text-xs flex p-2 rounded border ${
                                localApiState?.provider === StorageProviderType.LOCAL && 'border-blue-500 bg-blue-100'
                            }`}
                            type="button"
                            onClick={() => {
                                setLocalApiState({provider: StorageProviderType.LOCAL});
                                setStorageType({provider: StorageProviderType.LOCAL}, true);
                            }}
                        >
                            Local
                        </button>
                        <button
                            className={`font-bold focus:outline-none text-xs flex p-2 rounded border ${
                                localApiState?.provider === StorageProviderType.JSONBIN && 'border-blue-500 bg-blue-100'
                            }`}
                            type="button"
                            onClick={() => setLocalApiState({...localApiState, provider: StorageProviderType.JSONBIN})}
                        >
                            JSONbin
                        </button>
                        <button
                            className={`font-bold focus:outline-none text-xs flex p-2 rounded border ${
                                localApiState?.provider === StorageProviderType.ARCADE && 'border-blue-500 bg-blue-100'
                            }`}
                            type="button"
                            onClick={() => setLocalApiState({...localApiState, provider: StorageProviderType.ARCADE})}
                        >
                            Arcade
                        </button>
                    </div>
                </div>
                {[StorageProviderType.JSONBIN, StorageProviderType.ARCADE].includes(
                    localApiState?.provider as StorageProviderType
                ) && (
                    <>
                        <div className="space-y-4">
                            <div className="text-xxs text-gray-600">
                                Create an account at{' '}
                                <a href="https://jsonbin.io/" target="_blank" rel="noreferrer" className="underline">
                                    JSONbin.io
                                </a>
                                , copy the Secret Key into the field, and click on save. If you or your team already
                                have a version stored, add the secret and the corresponding ID.
                            </div>
                            <Input
                                full
                                label="Name"
                                value={localApiState.name}
                                onChange={handleChange}
                                type="text"
                                name="name"
                                required
                            />
                            <div className="gap-2 flex justify-between items-end">
                                <Input
                                    full
                                    label="Secret"
                                    value={localApiState.secret}
                                    onChange={handleChange}
                                    type="text"
                                    name="secret"
                                    required
                                />
                                <Input
                                    full
                                    label="ID (optional)"
                                    value={localApiState.id}
                                    onChange={handleChange}
                                    type="text"
                                    name="id"
                                    required
                                />
                                <Button
                                    variant="primary"
                                    disabled={!localApiState.secret && !localApiState.name}
                                    onClick={() =>
                                        localApiState.id
                                            ? handleSyncClick({provider: localApiState.provider})
                                            : handleCreateNewClick(localApiState.provider)
                                    }
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                        {apiProviders.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex flex-row justify-between items-center">
                                    <Heading size="small">Stored providers for {localApiState.provider}</Heading>
                                    <div className="switch flex items-center">
                                        <input
                                            className="switch__toggle"
                                            type="checkbox"
                                            id="updatemode"
                                            checked={updateAfterApply}
                                            onChange={() => toggleUpdateAfterApply(!updateAfterApply)}
                                        />
                                        <label className="switch__label text-xs" htmlFor="updatemode">
                                            Update on apply
                                        </label>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {apiProviders
                                        .filter((item) => item.provider === localApiState.provider)
                                        .map(({provider, id, name, secret}) => (
                                            <div
                                                key={`${provider}-${id}`}
                                                className={`border text-left flex flex-row justify-between rounded p-2 ${
                                                    isActive(provider, id)
                                                        ? 'bg-blue-100 bg-opacity-50 border-blue-400'
                                                        : 'hover:border-blue-300 border-gray-300'
                                                }`}
                                            >
                                                <div className="flex flex-col flex-grow">
                                                    <div className="font-bold text-xs">{name}</div>
                                                    <div className="text-xxs opacity-75">{id}</div>
                                                    {!isActive(provider, id) && (
                                                        <button
                                                            type="button"
                                                            className="underline text-red-600 text-xxs text-left inline-flex"
                                                            onClick={() => deleteProvider({id, secret})}
                                                        >
                                                            Delete local credentials
                                                        </button>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="secondary"
                                                    disabled={isActive(provider, id)}
                                                    onClick={() => restoreStoredProvider({provider, id, name, secret})}
                                                >
                                                    Apply
                                                </Button>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
export default Settings;

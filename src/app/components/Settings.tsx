/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from 'react';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';
import {StorageProviderType} from '../../types/api';
import Button from './Button';
import Input from './Input';
import {createNewBin, fetchDataFromRemote} from '../store/remoteTokens';
import Heading from './Heading';
import TokenData from './TokenData';
import {compareUpdatedAt} from './utils';
import ProviderItem from './ProviderItem';

const ProviderButton = ({text, onClick, isActive}) => (
    <button
        className={`font-bold focus:outline-none text-xs flex p-2 rounded border ${
            isActive && 'border-blue-500 bg-blue-100'
        }`}
        type="button"
        onClick={onClick}
    >
        {text}
    </button>
);

const Settings = () => {
    const {tokenData, localApiState, apiProviders, updateAfterApply} = useTokenState();
    const {
        setLocalApiState,
        setApiData,
        setStorageType,
        toggleUpdateAfterApply,
        setLoading,
        updateTokens,
        setTokenData,
    } = useTokenDispatch();

    const handleChange = (e) => {
        setLocalApiState({...localApiState, [e.target.name]: e.target.value});
    };

    const handleSyncClick = async ({
        id = localApiState.id,
        secret = localApiState.secret,
        name = localApiState.name,
        provider,
    }) => {
        console.log('syncing', id, secret, name, provider);
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
                setTokenData(new TokenData(remoteTokens));
                if (updateAfterApply) {
                    console.log('should update!', remoteTokens);
                    updateTokens(false);
                }
            } else {
                setTokenData(new TokenData(remoteTokens));
                if (updateAfterApply) {
                    console.log('should update!', remoteTokens);
                    updateTokens(false);
                }
            }
        }
        setLoading(false);
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

    React.useEffect(() => {
        console.log('localapistate', localApiState);
    }, []);

    const selectedRemoteProvider = () => {
        return [StorageProviderType.JSONBIN, StorageProviderType.ARCADE].includes(
            localApiState?.provider as StorageProviderType
        );
    };

    const storedApiProviders = () => {
        return apiProviders.filter((item) => item.provider === localApiState.provider);
    };

    const storageProviderText = () => {
        switch (localApiState?.provider) {
            case StorageProviderType.JSONBIN:
                return (
                    <div>
                        Create an account at{' '}
                        <a href="https://jsonbin.io/" target="_blank" rel="noreferrer" className="underline">
                            JSONbin.io
                        </a>
                        , copy the Secret Key into the field, and click on save. If you or your team already have a
                        version stored, add the secret and the corresponding ID.
                    </div>
                );
            case StorageProviderType.ARCADE:
                return (
                    <div>
                        Arcade is currently in Early Access. If you have an Arcade account, use your project's ID and
                        your API key to gain access.
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col flex-grow">
            <div className="p-4 space-y-4 border-b">
                <div className="space-y-4">
                    <Heading>Token Storage</Heading>
                    <div className="flex flex-row gap-2">
                        <ProviderButton
                            isActive={localApiState?.provider === StorageProviderType.LOCAL}
                            onClick={() => {
                                setLocalApiState({provider: StorageProviderType.LOCAL});
                                setStorageType({provider: StorageProviderType.LOCAL}, true);
                            }}
                            text="Local document"
                        />
                        <ProviderButton
                            isActive={localApiState?.provider === StorageProviderType.JSONBIN}
                            onClick={() => {
                                setLocalApiState({provider: StorageProviderType.JSONBIN});
                            }}
                            text="JSONbin"
                        />
                        <ProviderButton
                            isActive={localApiState?.provider === StorageProviderType.ARCADE}
                            onClick={() => {
                                setLocalApiState({provider: StorageProviderType.ARCADE});
                            }}
                            text="Arcade"
                        />
                    </div>
                </div>
                {selectedRemoteProvider() && (
                    <>
                        <div className="space-y-4">
                            <div className="text-gray-600 text-xxs">{storageProviderText()}</div>
                            <Input
                                full
                                label="Name"
                                value={localApiState.name}
                                onChange={handleChange}
                                type="text"
                                name="name"
                                required
                            />
                            <div className="flex items-end justify-between gap-2">
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
                                <div className="flex flex-row items-center justify-between">
                                    <Heading size="small">Stored providers for {localApiState.provider}</Heading>
                                    <div className="flex items-center switch">
                                        <input
                                            className="switch__toggle"
                                            type="checkbox"
                                            id="updatemode"
                                            checked={updateAfterApply}
                                            onChange={() => toggleUpdateAfterApply(!updateAfterApply)}
                                        />
                                        <label className="text-xs switch__label" htmlFor="updatemode">
                                            Update on apply
                                        </label>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {storedApiProviders().map(({provider, id, name, secret}) => (
                                        <ProviderItem
                                            key={`${provider}-${id}-${secret}`}
                                            handleSync={handleSyncClick}
                                            provider={provider}
                                            id={id}
                                            name={name}
                                            secret={secret}
                                        />
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

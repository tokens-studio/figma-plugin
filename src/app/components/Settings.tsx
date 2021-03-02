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
import ConfirmLocalStorageModal from './modals/ConfirmLocalStorageModal';
import StorageItem from './StorageItem';
import ProviderSelector from './StorageProviderSelector';

const Settings = () => {
    const {tokenData, api, storageType, localApiState, apiProviders, updateAfterApply} = useTokenState();
    const {
        setLocalApiState,
        setApiData,
        setStorageType,
        toggleUpdateAfterApply,
        setLoading,
        updateTokens,
        setTokenData,
    } = useTokenDispatch();

    const [confirmModalVisible, showConfirmModal] = React.useState(false);
    const [showEditFields, setShowEditFields] = React.useState(false);
    const [hasErrored, setHasErrored] = React.useState(false);

    const handleChange = (e) => {
        setLocalApiState({...localApiState, [e.target.name]: e.target.value});
    };

    const handleSyncClick = async ({
        id = localApiState.id,
        secret = localApiState.secret,
        name = localApiState.name,
        provider,
    }) => {
        setLoading(true);
        setHasErrored(false);
        const remoteTokens = await fetchDataFromRemote(id, secret, name, provider);
        if (remoteTokens) {
            setStorageType({provider, id, name}, true);
            setApiData({id, secret, name, provider});
            setShowEditFields(false);
            const comparison = await compareUpdatedAt(tokenData.getUpdatedAt(), remoteTokens);
            if (comparison === 'remote_older') {
                setTokenData(new TokenData(remoteTokens));
                if (updateAfterApply) {
                    updateTokens(false);
                }
            } else {
                setTokenData(new TokenData(remoteTokens));
                if (updateAfterApply) {
                    updateTokens(false);
                }
            }
        } else {
            setHasErrored(true);
        }
        setLoading(false);
    };

    const handleCreateNewClick = async (provider) => {
        setLoading(true);
        setHasErrored(false);
        const response = await createNewBin({
            provider,
            secret: localApiState.secret,
            tokens: tokenData.reduceToValues(),
            name: localApiState.name,
            updatedAt: tokenData.getUpdatedAt(),
            setApiData,
            setStorageType,
        });
        if (response) {
            setShowEditFields(false);
        } else {
            setHasErrored(true);
        }
        setLoading(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (localApiState.id) {
            handleSyncClick({provider: localApiState.provider});
        } else {
            handleCreateNewClick(localApiState.provider);
        }
    };

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
                        <a href="https://usearcade.com" target="_blank" className="underline" rel="noreferrer">
                            Arcade
                        </a>{' '}
                        is currently in Early Access. If you have an Arcade account, use your project ID and your API
                        key to gain access. For now, just the Read-Only mode is supported.
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col flex-grow">
            <ConfirmLocalStorageModal
                isOpen={confirmModalVisible}
                onClose={showConfirmModal}
                onSuccess={() => {
                    setLocalApiState({provider: StorageProviderType.LOCAL});
                    setStorageType({provider: StorageProviderType.LOCAL}, true);
                    showConfirmModal(false);
                }}
            />
            <div className="p-4 space-y-4 border-b">
                <div className="space-y-4">
                    <Heading>Token Storage</Heading>
                    <div className="flex flex-row gap-2">
                        <ProviderSelector
                            isActive={localApiState?.provider === StorageProviderType.LOCAL}
                            isStored={storageType?.provider === StorageProviderType.LOCAL}
                            onClick={() => showConfirmModal(true)}
                            text="Local document"
                        />
                        <ProviderSelector
                            isActive={localApiState?.provider === StorageProviderType.JSONBIN}
                            isStored={storageType?.provider === StorageProviderType.JSONBIN}
                            onClick={() => {
                                setLocalApiState({name: '', secret: '', id: '', provider: StorageProviderType.JSONBIN});
                            }}
                            text="JSONbin"
                        />
                        <ProviderSelector
                            isActive={localApiState?.provider === StorageProviderType.ARCADE}
                            isStored={storageType?.provider === StorageProviderType.ARCADE}
                            onClick={() => {
                                setLocalApiState({name: '', secret: '', id: '', provider: StorageProviderType.ARCADE});
                            }}
                            text="Arcade"
                        />
                    </div>
                </div>
                {selectedRemoteProvider() && (
                    <>
                        <div className="text-gray-600 text-xxs">{storageProviderText()}</div>
                        {showEditFields ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                        label={`ID${
                                            localApiState.provider === StorageProviderType.JSONBIN ? ' (optional)' : ''
                                        }`}
                                        value={localApiState.id}
                                        onChange={handleChange}
                                        type="text"
                                        name="id"
                                        required={localApiState.provider !== StorageProviderType.JSONBIN}
                                    />
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={!localApiState.secret && !localApiState.name}
                                    >
                                        Save
                                    </Button>
                                </div>
                                {hasErrored && (
                                    <div className="bg-red-200 text-red-700 rounded p-4 text-xs font-bold">
                                        There was an error connecting. Check your credentials.
                                    </div>
                                )}
                            </form>
                        ) : (
                            <Button variant="secondary" onClick={() => setShowEditFields(true)}>
                                Add new credentials
                            </Button>
                        )}
                        {storedApiProviders().length > 0 && (
                            <div className="space-y-4">
                                {api.provider === localApiState.provider && (
                                    <StorageItem
                                        handleSync={handleSyncClick}
                                        provider={api.provider}
                                        id={api.id}
                                        name={api.name}
                                        secret={api.secret}
                                    />
                                )}
                                {storedApiProviders().length > 1 && (
                                    <details>
                                        <summary className="p-2 rounded bg-gray-100 cursor-pointer text-xs focus:outline-none hover:bg-gray-200 focus:bg-gray-200">
                                            {storedApiProviders().length} providers stored on this device
                                        </summary>
                                        <div className="flex flex-row items-center justify-between">
                                            <Heading size="small">
                                                Stored providers for {localApiState.provider}
                                            </Heading>
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
                                                <StorageItem
                                                    key={`${provider}-${id}-${secret}`}
                                                    handleSync={handleSyncClick}
                                                    provider={provider}
                                                    id={id}
                                                    name={name}
                                                    secret={secret}
                                                />
                                            ))}
                                        </div>
                                    </details>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
export default Settings;

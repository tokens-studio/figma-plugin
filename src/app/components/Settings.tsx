import * as React from 'react';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';
import {StorageProviderType} from '../store/types';
import Button from './Button';
import Input from './Input';
import {compareUpdatedAt, createNewBin, fetchDataFromJSONBin} from './updateRemoteTokens';
import Heading from './Heading';
import TokenData from './TokenData';
import {postToFigma} from '../../plugin/notifiers';

const Settings = () => {
    const {tokenData, storageType, api, apiProviders} = useTokenState();
    const {setLoading, setApiData, setStorageType, setTokenData} = useTokenDispatch();
    const [localApiState, setLocalApiState] = React.useState({
        id: api.id,
        secret: api.secret,
        name: api.name,
    });

    const isActive = (provider, id) => {
        return storageType.id === id && storageType.provider === provider;
    };

    React.useEffect(() => {
        setLocalApiState({id: api.id, name: api.name, secret: api.secret});
    }, [api]);

    const handleChange = (e) => {
        setLocalApiState({...localApiState, [e.target.name]: e.target.value});
    };

    const handleCreateNewClick = async () => {
        setApiData({secret: localApiState.secret, provider: 'jsonbin', name: localApiState.name});
        createNewBin({
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
        setApiData({id, secret, name, provider: 'jsonbin'});
        const remoteTokens = await fetchDataFromJSONBin(id, secret, name);
        if (remoteTokens) {
            const comparison = await compareUpdatedAt(tokenData.getUpdatedAt(), remoteTokens);
            if (comparison === 'remote_older') {
                console.log(
                    'Remote is older, ask user if they want to overwrite their local progress or upload to remote.'
                );
            } else {
                setTokenData(new TokenData(remoteTokens), remoteTokens.updatedAt);
            }
        }
        setLoading(false);
    };

    const restoreStoredProvider = (provider) => {
        setLocalApiState(provider);
        handleSyncClick(provider);
    };

    const deleteProvider = ({id, secret}) => {
        postToFigma({
            type: 'remove-single-credential',
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
                                storageType?.provider === StorageProviderType.LOCAL && 'border-blue-500 bg-blue-100'
                            }`}
                            type="button"
                            onClick={() => setStorageType({provider: StorageProviderType.LOCAL}, true)}
                        >
                            Local
                        </button>
                        <button
                            className={`font-bold focus:outline-none text-xs flex p-2 rounded border ${
                                storageType?.provider === StorageProviderType.JSONBIN && 'border-blue-500 bg-blue-100'
                            }`}
                            type="button"
                            onClick={() => setStorageType({...storageType, provider: StorageProviderType.JSONBIN})}
                        >
                            JSONbin
                        </button>
                    </div>
                </div>
                {storageType?.provider === StorageProviderType.JSONBIN && (
                    <div className="space-y-4">
                        <div className="text-xxs text-gray-600">
                            Create an account at{' '}
                            <a href="https://jsonbin.io/" target="_blank" rel="noreferrer" className="underline">
                                JSONbin.io
                            </a>
                            , copy the Secret Key into the field, and click on save. If you or your team already have a
                            version stored, add the secret and the corresponding ID.
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
                                        ? handleSyncClick({provider: StorageProviderType.JSONBIN})
                                        : handleCreateNewClick()
                                }
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                )}
                {apiProviders.length > 0 && storageType.provider !== StorageProviderType.LOCAL && (
                    <div className="space-y-4">
                        <Heading size="small">Stored providers for {storageType.provider}</Heading>
                        <div className="flex flex-col gap-2">
                            {apiProviders
                                .filter((item) => item.provider === storageType.provider)
                                .map(({provider, id, name, secret}) => (
                                    <div
                                        key={`${provider}-${id}`}
                                        className={`border text-left flex flex-row justify-between hover:bg-gray-100 rounded p-2 ${
                                            isActive(provider, id) ? 'border-blue-300' : 'border-gray-300'
                                        }`}
                                    >
                                        <div className="flex flex-col flex-grow">
                                            <div className="font-bold text-xs">{name}</div>
                                            <div className="text-xxs text-gray-600">{id}</div>
                                            <button
                                                type="button"
                                                className="underline text-red-600 text-xxs text-left"
                                                onClick={() => deleteProvider({id, secret})}
                                            >
                                                Delete
                                            </button>
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
            </div>
        </div>
    );
};
export default Settings;

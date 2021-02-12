import * as React from 'react';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';
import {StorageProviderType} from '../store/types';
import Button from './Button';
import Input from './Input';
import {createNewBin, fetchDataFromJSONBin} from './updateRemoteTokens';
import Heading from './Heading';
import TokenData from './TokenData';

const Settings = () => {
    const {tokenData, storageType, api, apiProviders} = useTokenState();
    const {setLoading, setApiData, setStorageType, setTokenData} = useTokenDispatch();
    const [localApiState, setLocalApiState] = React.useState({
        id: api.id,
        secret: api.secret,
        name: api.name,
    });

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
        const remoteValues = await fetchDataFromJSONBin(id, secret, name);
        if (remoteValues) {
            const oldUpdated = tokenData.getUpdatedAt();
            const newUpdated = remoteValues.updatedAt;
            console.log('exactly the same tokens, saving', oldUpdated, newUpdated);
            setTokenData(new TokenData(remoteValues), newUpdated);
        }
        setLoading(false);
    };

    const restoreStoredProvider = (provider) => {
        setLocalApiState(provider);
        handleSyncClick(provider);
    };

    return (
        <div className="flex flex-col flex-grow">
            <div className="p-4 space-y-4">
                <div className="border p-4">
                    <div className="space-y-2">
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
                                    storageType?.provider === StorageProviderType.JSONBIN &&
                                    'border-blue-500 bg-blue-100'
                                }`}
                                type="button"
                                onClick={() => setStorageType({...storageType, provider: StorageProviderType.JSONBIN})}
                            >
                                JSONbin
                            </button>
                        </div>
                    </div>
                    {storageType?.provider === StorageProviderType.JSONBIN && (
                        <div>
                            <Input
                                full
                                label="Name"
                                value={localApiState.name}
                                onChange={handleChange}
                                type="text"
                                name="name"
                                required
                            />
                            <div className="space-x-2 flex justify-between items-end">
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
                                    size="large"
                                    variant="primary"
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
                    {apiProviders.length > 0 && (
                        <div>
                            <Heading>Stored providers</Heading>
                            <div className="flex flex-col space-y-2">
                                {/* allow users to remove saved providers or activate other set */}
                                {apiProviders
                                    .filter((item) => item.provider === storageType.provider)
                                    .map(({provider, id, name, secret}) => (
                                        <button
                                            key={`${provider}-${id}`}
                                            type="button"
                                            onClick={() => restoreStoredProvider({provider, id, name, secret})}
                                        >
                                            <div className="font-bold">{name}</div>
                                            <div className="text-xs text-gray-600">{id}</div>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default Settings;

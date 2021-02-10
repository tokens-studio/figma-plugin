import * as React from 'react';
import {StorageProviderType, useTokenDispatch, useTokenState} from '../store/TokenContext';
import Button from './Button';
import {setTokenData} from '../../plugin/node';
import Input from './Input';
import {createNewBin, fetchDataFromJSONBin} from './utils';
import Heading from './Heading';

const Settings = () => {
    const {tokenData, storageType, api, apiProviders} = useTokenState();
    const {setLoading, setApiData, setStorageType} = useTokenDispatch();
    const [apiID, setApiID] = React.useState(api.id);
    const [apiSecret, setApiSecret] = React.useState(api.secret);
    const [apiName, setApiName] = React.useState(api.name);

    React.useEffect(() => {
        setApiID(api.id);
        setApiSecret(api.secret);
    }, [api]);

    const handleApiSecretChange = (e) => {
        setApiSecret(e.target.value);
    };
    const handleApiNameChange = (e) => {
        setApiName(e.target.value);
    };
    const handleApiIDChange = (e) => {
        setApiID(e.target.value);
    };

    const handleCreateNewClick = async () => {
        setApiData({secret: apiSecret, provider: 'jsonbin', name: apiName});
        createNewBin({
            secret: apiSecret,
            tokens: tokenData.reduceToValues(),
            name: apiName,
            setApiData,
            setStorageType,
        });
    };

    const handleSyncClick = async () => {
        setLoading(true);
        setStorageType({provider: StorageProviderType.JSONBIN, id: apiID}, true);
        setApiData({id: apiID, secret: apiSecret, name: apiName, provider: 'jsonbin'});
        const tokenValues = await fetchDataFromJSONBin(apiID, apiSecret, apiName);
        // check if this works
        if (tokenValues?.values?.options) setTokenData(tokenValues.values);
        setLoading(false);
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
                                value={apiName}
                                onChange={handleApiNameChange}
                                type="text"
                                name="apiName"
                                required
                            />
                            <div className="space-x-2 flex justify-between items-end">
                                <Input
                                    full
                                    label="Secret"
                                    value={apiSecret}
                                    onChange={handleApiSecretChange}
                                    type="text"
                                    name="apiSecret"
                                    required
                                />
                                <Input
                                    full
                                    label="ID (optional)"
                                    placeholder="Leave blank to create new"
                                    value={apiID}
                                    onChange={handleApiIDChange}
                                    type="text"
                                    name="apiUrl"
                                    required
                                />
                                <Button
                                    size="large"
                                    variant="primary"
                                    onClick={() => (apiID ? handleSyncClick() : handleCreateNewClick())}
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
                                {/* allow users to remove saved providers */}
                                {apiProviders.map(({provider, id, name}) => (
                                    <div key={`${provider}-${id}`}>
                                        {provider}
                                        {id}
                                        {name}
                                    </div>
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

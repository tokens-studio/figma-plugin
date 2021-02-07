import * as React from 'react';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';
import Button from './Button';
import {setTokenData} from '../../plugin/node';
import Input from './Input';
import TokenData from './TokenData';
import {createNewBin, initializeWithThemerData} from './utils';
import Heading from './Heading';

const Settings = () => {
    const {tokenData, api} = useTokenState();
    const {setLoading, setApiData} = useTokenDispatch();
    const [apiID, setApiID] = React.useState(api.id);
    const [apiSecret, setApiSecret] = React.useState(api.secret);
    const [provider, setProvider] = React.useState(api.provider);

    React.useEffect(() => {
        setApiID(api.id);
        setApiSecret(api.secret);
    }, [api]);

    const handleApiSecretChange = (e) => {
        setApiSecret(e.target.value);
    };
    const handleApiIDChange = (e) => {
        setApiID(e.target.value);
    };
    const handleCreateNewClick = async () => {
        console.log('creating new', tokenData.reduceToValues());
        setApiData({secret: apiSecret, provider: 'jsonbin'});
        createNewBin(apiSecret, tokenData.reduceToValues(), setApiData);
    };
    const handleSyncClick = async () => {
        setLoading(true);
        setApiData({id: apiID, secret: apiSecret, provider: 'jsonbin'});
        const tokenValues = initializeWithThemerData(apiID, apiSecret);
        if (tokenValues) {
            setTokenData(new TokenData(tokenValues));
            setLoading(false);
            console.log('got values!!');
        }
    };

    return (
        <div className="flex flex-col flex-grow">
            <div className="p-4 space-y-4">
                <Heading>Sync Provider</Heading>
                <div className="flex flex-row gap-2">
                    <button
                        className={`font-bold focus:outline-none text-xs flex p-4 border ${
                            provider === 'jsonbin' && 'border-blue-500 bg-blue-100'
                        }`}
                        type="button"
                        onClick={() => setProvider('jsonbin')}
                    >
                        JSONbin.io
                    </button>
                    <button
                        className={`font-bold focus:outline-none text-xs flex p-4 border ${
                            provider === 'arcade' && 'border-blue-500 bg-blue-100'
                        }`}
                        type="button"
                        onClick={() => setProvider('arcade')}
                    >
                        Arcade
                    </button>
                </div>
                {provider === 'jsonbin' && (
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
                )}
            </div>
        </div>
    );
};
export default Settings;

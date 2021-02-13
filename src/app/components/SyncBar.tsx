import * as React from 'react';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';
import Tooltip from './Tooltip';
import Icon from './Icon';
import TokenData from './TokenData';
import {pullRemoteTokens} from '../store/remoteTokens';

const SyncBar = () => {
    const {storageType, api} = useTokenState();
    const {setTokenData, setLoading} = useTokenDispatch();

    const handlePull = async () => {
        setLoading(true);
        const updatedTokens = await pullRemoteTokens(api);
        setTokenData(new TokenData(updatedTokens), updatedTokens.updatedAt);
        setLoading(false);
    };

    return (
        <div className="flex flex-row items-center px-4">
            <div className="text-xxs text-gray-600 py-2 flex flex-row gap-1">Sync active ({storageType.provider})</div>
            <Tooltip label={`Pull from ${storageType.provider}`}>
                <button onClick={handlePull} type="button" className="button button-ghost">
                    <Icon name="refresh" />
                </button>
            </Tooltip>
        </div>
    );
};

export default SyncBar;

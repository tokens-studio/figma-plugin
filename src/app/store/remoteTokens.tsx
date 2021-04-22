import {useDispatch} from 'react-redux';
import {SingleToken, TokenProps} from '@types/tokens';
import {StorageProviderType} from '@types/api';
import {notifyToUI} from '../../plugin/notifiers';
import {useJSONbin} from './providers/jsonbin';
import useArcade from './providers/arcade';
import {useTokenDispatch, useTokenState} from './TokenContext';
import {compareUpdatedAt} from '../components/utils';
import {Dispatch} from '../store';
import useTokens from './useTokens';
import useStorage from './useStorage';

export default function useRemoteTokens() {
    const dispatch = useDispatch<Dispatch>();

    const {api, updateAfterApply, lastUpdatedAt, localApiState} = useTokenState();
    const {setLoading, setApiData} = useTokenDispatch();
    const {updateTokens} = useTokens();
    const {setStorageType} = useStorage();
    const {fetchDataFromArcade, editArcadeToken, createArcadeToken, deleteArcadeToken} = useArcade();
    const {fetchDataFromJSONBin, createNewJSONBin} = useJSONbin();

    const pullTokens = async () => {
        console.log('Pull tokens');
        const {id, secret, provider, name} = api;
        if (!id && !secret) return;

        setLoading(true);

        notifyToUI('Fetching from remote...');
        let tokenValues;

        switch (provider) {
            case StorageProviderType.JSONBIN: {
                tokenValues = await fetchDataFromJSONBin(id, secret, name);
                notifyToUI('Updated!');
                break;
            }
            case StorageProviderType.ARCADE: {
                tokenValues = await fetchDataFromArcade(id, secret, name);
                notifyToUI('Updated!');
                break;
            }
            default:
                throw new Error('Not implemented');
        }

        dispatch.tokenState.setTokenData(tokenValues);
        setLoading(false);
    };

    async function editRemoteToken(data: {
        parent: string;
        name: string;
        value: SingleToken;
        options?: object;
        oldName?: string;
    }) {
        setLoading(true);
        const {id, secret} = api;
        const response = await editArcadeToken({id, secret, data});
        if (response) {
            setLoading(false);
            return true;
        }
        setLoading(false);
        return false;
    }

    async function createRemoteToken(data: {
        parent: string;
        name: string;
        value: SingleToken;
        options?: object;
    }): Promise<boolean> {
        setLoading(true);
        const {id, secret} = api;
        const response = await createArcadeToken({id, secret, data});
        if (response) {
            setLoading(false);
            return true;
        }
        setLoading(false);
        return false;
    }

    async function deleteRemoteToken(data) {
        const {id, secret} = api;
        deleteArcadeToken({id, secret, data});
    }

    async function fetchDataFromRemote(id, secret, name, provider): Promise<TokenProps> {
        console.log('fetch tokens');

        notifyToUI('Fetching remote tokens...');

        switch (provider) {
            case StorageProviderType.JSONBIN: {
                return fetchDataFromJSONBin(id, secret, name);
            }
            case StorageProviderType.ARCADE: {
                return fetchDataFromArcade(id, secret, name);
            }
            default:
                throw new Error('Strategy not implemented');
        }
    }

    const syncTokens = async ({id, secret, provider = localApiState.provider, name}) => {
        console.log('Sync tokens');
        setLoading(true);
        const remoteTokens = await fetchDataFromRemote(id, secret, name, provider as StorageProviderType);
        if (remoteTokens) {
            setStorageType({provider: {provider, id, name}, bool: true});
            setApiData({id, secret, name, provider});
            const comparison = await compareUpdatedAt(lastUpdatedAt, remoteTokens);
            if (comparison === 'remote_older') {
                dispatch.tokenState.setTokenData(remoteTokens);
            } else {
                dispatch.tokenState.setTokenData(remoteTokens);
            }
            setLoading(false);
            return remoteTokens;
        }
        setLoading(false);
        return null;
    };

    async function addNewProviderItem({id, provider, secret, tokens, name, updatedAt}): Promise<TokenProps | null> {
        notifyToUI('Checking credentials...');

        switch (provider) {
            case StorageProviderType.JSONBIN: {
                if (id) {
                    return syncTokens({id, secret, provider: StorageProviderType.JSONBIN, name});
                }
                return createNewJSONBin({provider, secret, tokens, name, updatedAt});
            }
            case StorageProviderType.ARCADE: {
                return syncTokens({id, secret, provider: StorageProviderType.ARCADE, name});
            }
            default:
                throw new Error('Not implemented');
        }
    }

    return {
        pullTokens,
        editRemoteToken,
        createRemoteToken,
        deleteRemoteToken,
        syncTokens,
        fetchDataFromRemote,
        addNewProviderItem,
    };
}

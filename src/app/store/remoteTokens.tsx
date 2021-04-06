import {SingleToken, TokenProps} from '../../../types/tokens';
import {StorageProviderType} from '../../../types/api';
import {notifyToUI} from '../../plugin/notifiers';
import {useJSONbin} from './providers/jsonbin';
import useArcade from './providers/arcade';
import {useTokenDispatch, useTokenState} from './TokenContext';
import {compareUpdatedAt} from '../components/utils';

export default function useRemoteTokens() {
    const {api, updateAfterApply, lastUpdatedAt, localApiState} = useTokenState();
    const {setLoading, setTokenData, updateTokens, setApiData, setStorageType, updateSingleToken} = useTokenDispatch();
    const {fetchDataFromArcade, editArcadeToken, createArcadeToken, deleteArcadeToken} = useArcade();
    const {fetchDataFromJSONBin, createNewJSONBin} = useJSONbin();

    const pullTokens = async () => {
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
        console.log('Got Pull values', tokenValues);

        setTokenData(tokenValues);
        updateTokens(false);
        setLoading(false);
    };

    async function editRemoteToken(data: {
        parent: string;
        name: string;
        value: SingleToken;
        options?: object;
        oldName?: string;
    }) {
        const {parent, name, value, options, oldName} = data;
        setLoading(true);
        const {id, secret} = api;
        const response = await editArcadeToken({id, secret, data});
        if (response) {
            updateSingleToken({
                parent,
                name,
                value,
                options,
                oldName,
            });
            updateTokens();
        }
        setLoading(false);
    }

    async function createRemoteToken(data: {parent: string; name: string; value: SingleToken; options?: object}) {
        setLoading(true);
        const {id, secret} = api;
        const response = await createArcadeToken({id, secret, data});
        if (response) {
            console.log('response', response);
        }
        setLoading(false);
    }

    async function deleteRemoteToken(data) {
        const {id, secret} = api;
        deleteArcadeToken({id, secret, data});
    }

    async function fetchDataFromRemote(id, secret, name, provider): Promise<TokenProps> {
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
        setLoading(true);
        const remoteTokens = await fetchDataFromRemote(id, secret, name, provider as StorageProviderType);
        if (remoteTokens) {
            setStorageType({provider, id, name}, true);
            setApiData({id, secret, name, provider});
            const comparison = await compareUpdatedAt(lastUpdatedAt, remoteTokens);
            if (comparison === 'remote_older') {
                console.log('Got remote older values', remoteTokens);

                setTokenData(remoteTokens);
                if (updateAfterApply) {
                    updateTokens(false);
                }
            } else {
                console.log('Got sync values', remoteTokens);

                setTokenData(remoteTokens);
                if (updateAfterApply) {
                    updateTokens(false);
                }
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

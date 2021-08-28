import {useDispatch, useSelector} from 'react-redux';
import {SingleToken, TokenProps} from 'Types/tokens';
import {StorageProviderType} from 'Types/api';
import {notifyToUI} from '../../plugin/notifiers';
import {useJSONbin} from './providers/jsonbin';
import useArcade from './providers/arcade';
import {compareUpdatedAt} from '../components/utils';
import {Dispatch, RootState} from '../store';
import useStorage from './useStorage';
import {useURL} from './providers/url';
import {useGitHub} from './providers/github';

export default function useRemoteTokens() {
    const dispatch = useDispatch<Dispatch>();
    const {api, lastUpdatedAt, localApiState} = useSelector((state: RootState) => state.uiState);

    const {setStorageType} = useStorage();
    const {editArcadeToken, createArcadeToken, deleteArcadeToken} = useArcade();
    const {fetchDataFromJSONBin, createNewJSONBin} = useJSONbin();
    const {fetchDataFromURL, createNewURL} = useURL();
    const {fetchDataFromGitHub, readTokensFromGitHub} = useGitHub();

    const pullTokens = async () => {
        dispatch.uiState.setLoading(true);

        notifyToUI('Fetching from remote...');
        let tokenValues;

        switch (api.provider) {
            case StorageProviderType.JSONBIN: {
                tokenValues = await fetchDataFromJSONBin(api);
                notifyToUI('Updated!');
                break;
            }
            case StorageProviderType.URL: {
                tokenValues = await fetchDataFromURL(api);
                notifyToUI('Updated!');
                break;
            }
            case StorageProviderType.GITHUB: {
                tokenValues = await fetchDataFromGitHub(api);
                notifyToUI('Updated!');
                break;
            }
            default:
                throw new Error('Not implemented');
        }

        dispatch.tokenState.setTokenData(tokenValues);
        dispatch.uiState.setLoading(false);
    };

    const pushTokens = async () => {
        dispatch.uiState.setLoading(true);

        notifyToUI('Pushing to remote...');

        switch (api.provider) {
            case StorageProviderType.GITHUB: {
                await readTokensFromGitHub(api, true);
                notifyToUI('Updated!');
                break;
            }
            default:
                throw new Error('Not implemented');
        }

        dispatch.uiState.setLoading(false);
    };

    async function editRemoteToken(data: {
        parent: string;
        name: string;
        value: SingleToken;
        options?: object;
        oldName?: string;
    }) {
        dispatch.uiState.setLoading(true);
        const {id, secret} = api;
        const response = await editArcadeToken({id, secret, data});
        if (response) {
            dispatch.uiState.setLoading(false);
            return true;
        }
        dispatch.uiState.setLoading(false);
        return false;
    }

    async function createRemoteToken(data: {
        parent: string;
        name: string;
        value: SingleToken;
        options?: object;
    }): Promise<boolean> {
        dispatch.uiState.setLoading(true);
        const {id, secret} = api;
        const response = await createArcadeToken({id, secret, data});
        if (response) {
            dispatch.uiState.setLoading(false);
            return true;
        }
        dispatch.uiState.setLoading(false);
        return false;
    }

    async function deleteRemoteToken(data) {
        const {id, secret} = api;
        deleteArcadeToken({id, secret, data});
    }

    async function fetchDataFromRemote(context): Promise<TokenProps> {
        notifyToUI('Fetching remote tokens...');

        switch (context.provider) {
            case StorageProviderType.JSONBIN: {
                return fetchDataFromJSONBin(context);
            }
            case StorageProviderType.URL: {
                return fetchDataFromURL(context);
            }
            case StorageProviderType.GITHUB: {
                return fetchDataFromGitHub(context);
            }
            default:
                throw new Error('Strategy not implemented');
        }
    }

    const syncTokens = async (context) => {
        dispatch.uiState.setLoading(true);
        const remoteTokens = await fetchDataFromRemote(context);
        if (remoteTokens) {
            setStorageType({provider: context, bool: true});
            dispatch.uiState.setApiData(context);
            const comparison = await compareUpdatedAt(lastUpdatedAt, remoteTokens);
            if (comparison === 'remote_older') {
                dispatch.tokenState.setTokenData(remoteTokens);
            } else {
                dispatch.tokenState.setTokenData(remoteTokens);
            }
            dispatch.uiState.setLoading(false);
            return remoteTokens;
        }
        dispatch.uiState.setLoading(false);
        return null;
    };

    async function addNewProviderItem(context): Promise<TokenProps | null> {
        notifyToUI('Checking credentials...');

        switch (context.provider) {
            case StorageProviderType.JSONBIN: {
                if (context.id) {
                    return syncTokens(context);
                }
                return createNewJSONBin(context);
            }
            case StorageProviderType.URL:
            case StorageProviderType.GITHUB:
            case StorageProviderType.ARCADE: {
                return syncTokens(context);
            }
            default:
                throw new Error('Not implemented');
        }
    }

    return {
        pullTokens,
        pushTokens,
        editRemoteToken,
        createRemoteToken,
        deleteRemoteToken,
        syncTokens,
        fetchDataFromRemote,
        addNewProviderItem,
    };
}

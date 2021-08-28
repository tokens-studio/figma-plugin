import {useDispatch, useSelector} from 'react-redux';
import {SingleToken, TokenProps} from 'Types/tokens';
import {StorageProviderType} from 'Types/api';
import {MessageToPluginTypes} from 'Types/messages';
import {postToFigma} from '../../plugin/notifiers';
import {useJSONbin} from './providers/jsonbin';
import useArcade from './providers/arcade';
import {Dispatch, RootState} from '../store';
import useStorage from './useStorage';
import {useURL} from './providers/url';
import {useGitHub} from './providers/github';

export default function useRemoteTokens() {
    const dispatch = useDispatch<Dispatch>();
    const {api} = useSelector((state: RootState) => state.uiState);

    const {setStorageType} = useStorage();
    const {editArcadeToken, createArcadeToken, deleteArcadeToken} = useArcade();
    const {pullTokensFromJSONBin, addJSONBinCredentials, createNewJSONBin} = useJSONbin();
    const {addNewGitHubCredentials, pullTokensFromGitHub, pushTokensToGitHub} = useGitHub();

    const pullTokens = async (context = api) => {
        dispatch.uiState.setLoading(true);

        let tokenValues;

        switch (context.provider) {
            case StorageProviderType.JSONBIN: {
                tokenValues = await pullTokensFromJSONBin(context);
                break;
            }
            case StorageProviderType.GITHUB: {
                tokenValues = await pullTokensFromGitHub(context);
                break;
            }
            default:
                throw new Error('Not implemented');
        }

        if (tokenValues) {
            dispatch.tokenState.setLastSyncedState(JSON.stringify(tokenValues.values, null, 2));
            dispatch.tokenState.setTokenData(tokenValues);
        }

        dispatch.uiState.setLoading(false);
    };

    const restoreStoredProvider = async (context) => {
        dispatch.uiState.setLoading(true);
        dispatch.tokenState.setEmptyTokens();
        dispatch.uiState.setLocalApiState(context);
        dispatch.uiState.setApiData(context);
        setStorageType({provider: context, bool: true});
        await pullTokens(context, true);
        dispatch.uiState.setLoading(false);
        return null;
    };

    const pushTokens = async () => {
        dispatch.uiState.setLoading(true);

        switch (api.provider) {
            case StorageProviderType.GITHUB: {
                await pushTokensToGitHub(api);
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

    async function addNewProviderItem(context): Promise<TokenProps | null> {
        switch (context.provider) {
            case StorageProviderType.JSONBIN: {
                if (context.id) {
                    return addJSONBinCredentials(context);
                }
                return createNewJSONBin(context);
            }
            case StorageProviderType.GITHUB: {
                return addNewGitHubCredentials(context);
            }
            default:
                throw new Error('Not implemented');
        }
    }

    const deleteProvider = (provider) => {
        postToFigma({
            type: MessageToPluginTypes.REMOVE_SINGLE_CREDENTIAL,
            id: provider.id,
            secret: provider.secret,
        });
    };

    return {
        restoreStoredProvider,
        deleteProvider,
        pullTokens,
        pushTokens,
        editRemoteToken,
        createRemoteToken,
        deleteRemoteToken,
        addNewProviderItem,
    };
}

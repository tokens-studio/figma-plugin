import {useDispatch, useSelector} from 'react-redux';
import {StorageProviderType} from 'Types/api';
import {MessageToPluginTypes} from 'Types/messages';
import {postToFigma} from '../../plugin/notifiers';
import {useJSONbin} from './providers/jsonbin';
import {Dispatch, RootState} from '../store';
import useStorage from './useStorage';

export default function useRemoteTokens() {
    const dispatch = useDispatch<Dispatch>();
    const {api} = useSelector((state: RootState) => state.uiState);

    const {setStorageType} = useStorage();
    const {pullTokensFromJSONBin, addJSONBinCredentials, createNewJSONBin} = useJSONbin();

    const pullTokens = async (context = api) => {
        dispatch.uiState.setLoading(true);

        console.log('Pull Tokens', context);

        let tokenValues;

        switch (context.provider) {
            case StorageProviderType.JSONBIN: {
                tokenValues = await pullTokensFromJSONBin(context);
                break;
            }
            default:
                throw new Error('Not implemented');
        }

        if (tokenValues) {
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
        await pullTokens(context);
        dispatch.uiState.setLoading(false);
        return null;
    };

    async function addNewProviderItem(context): Promise<boolean> {
        let data;
        switch (context.provider) {
            case StorageProviderType.JSONBIN: {
                if (context.id) {
                    data = addJSONBinCredentials(context);
                } else {
                    data = createNewJSONBin(context);
                }
                break;
            }
            default:
                throw new Error('Not implemented');
        }
        if (data) {
            dispatch.uiState.setLocalApiState(context);
            dispatch.uiState.setApiData(context);
            setStorageType({provider: context, bool: true});
            return true;
        }
        return false;
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
        addNewProviderItem,
    };
}

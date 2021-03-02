import {TokenProps} from '../../types/tokens';
import {StorageProviderType} from '../../types/api';
import {postToFigma, notifyToUI} from '../../plugin/notifiers';
import {StateType} from '../../types/state';
import {MessageToPluginTypes} from '../../types/messages';
import {createNewJSONBin, fetchDataFromJSONBin, updateJSONBinTokens} from './providers/jsonbin';
import {createNewArcade, fetchDataFromArcade} from './providers/arcade';
import TokenData from '../components/TokenData';
import {useTokenDispatch, useTokenState} from './TokenContext';

export async function updateRemoteTokens({
    provider,
    tokens,
    id,
    secret,
    updatedAt,
    oldUpdatedAt,
}: {
    provider: StorageProviderType;
    tokens: TokenProps;
    id: string;
    secret: string;
    updatedAt: string;
    oldUpdatedAt?: string;
}) {
    notifyToUI('Updating remote...');

    if (!id && !secret) return;

    switch (provider) {
        case StorageProviderType.JSONBIN: {
            updateJSONBinTokens({
                tokens,
                id,
                secret,
                updatedAt,
                oldUpdatedAt,
            });
            break;
        }
        default:
            throw new Error('Not implemented');
    }
}

export function useRemoteTokens() {
    const {api} = useTokenState();
    const {setLoading, setTokenData, updateTokens} = useTokenDispatch();
    const {id, secret, provider, name} = api;

    const pullTokens = async () => {
        if (!id && !secret) return;

        setLoading(true);

        notifyToUI('Fetching from remote...', provider);
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
        setTokenData(new TokenData(tokenValues));
        updateTokens(false);
        setLoading(false);
    };

    return {pullTokens};
}

export async function updateTokensOnSources(state: StateType, updatedAt: string, shouldUpdate = true) {
    const isNotRemoteOrArcade = ![StorageProviderType.LOCAL, StorageProviderType.ARCADE].includes(
        state.storageType.provider
    );
    if (isNotRemoteOrArcade && shouldUpdate)
        updateRemoteTokens({
            provider: state.storageType.provider,
            tokens: state.tokenData.reduceToValues(),
            id: state.api.id,
            secret: state.api.secret,
            updatedAt,
            oldUpdatedAt: state.tokenData.getUpdatedAt(),
        }).then(() => {
            state.tokenData.setUpdatedAt(updatedAt);
        });

    postToFigma({
        type: MessageToPluginTypes.UPDATE,
        tokenValues: state.tokenData.reduceToValues(),
        tokens: state.tokenData.getMergedTokens(),
        updatePageOnly: state.updatePageOnly,
        updatedAt,
    });
}

export async function createNewBin({
    provider,
    secret,
    tokens,
    name,
    updatedAt,
    setApiData,
    setStorageType,
}): Promise<TokenProps | null> {
    notifyToUI('Creating new bin...');

    switch (provider) {
        case StorageProviderType.JSONBIN: {
            return createNewJSONBin({provider, secret, tokens, name, updatedAt, setApiData, setStorageType});
        }
        case StorageProviderType.ARCADE: {
            return createNewArcade();
        }
        default:
            throw new Error('Not implemented');
    }
}

export async function fetchDataFromRemote(id, secret, name, provider): Promise<TokenProps> {
    notifyToUI('Fetching remote tokens...');

    switch (provider) {
        case StorageProviderType.JSONBIN: {
            return fetchDataFromJSONBin(id, secret, name);
        }
        case StorageProviderType.ARCADE: {
            return fetchDataFromArcade(id, secret, name);
        }
        default:
            throw new Error('Not implemented');
    }
}

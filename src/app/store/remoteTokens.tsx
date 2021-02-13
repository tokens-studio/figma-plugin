import {TokenProps} from '../../types/tokens';
import {StorageProviderType} from '../../types/api';
import {postToFigma, notifyToUI} from '../../plugin/notifiers';
import {StateType} from '../../types/state';
import {MessageToPluginTypes} from '../../types/messages';
import {createNewJSONBin, fetchDataFromJSONBin, updateJSONBinTokens} from './providers/jsonbin';

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

export async function pullRemoteTokens({id, secret, provider, name}) {
    if (!id && !secret) return;

    notifyToUI('Fetching from remote...');
    let tokenValues;

    switch (provider) {
        case StorageProviderType.JSONBIN: {
            tokenValues = await fetchDataFromJSONBin(id, secret, name);
            notifyToUI('Updated!');
            break;
        }
        default:
            throw new Error('Not implemented');
    }
    return tokenValues;
}

export async function updateTokensOnSources(state: StateType, updatedAt: string) {
    if (state.storageType.provider !== StorageProviderType.LOCAL)
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

export async function createNewBin({provider, secret, tokens, name, updatedAt, setApiData, setStorageType}) {
    notifyToUI('Creating new bin...');

    switch (provider) {
        case StorageProviderType.JSONBIN: {
            return createNewJSONBin({provider, secret, tokens, name, updatedAt, setApiData, setStorageType});
        }
        default:
            throw new Error('Not implemented');
    }
}

export async function fetchDataFromRemote(id, secret, name, provider): Promise<TokenProps> {
    switch (provider) {
        case StorageProviderType.JSONBIN: {
            return fetchDataFromJSONBin(id, secret, name);
        }
        default:
            throw new Error('Not implemented');
    }
}

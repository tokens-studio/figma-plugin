import {MessageToPluginTypes} from '@types/messages';
import {computeMergedTokens, reduceToValues} from '@/plugin/tokenHelpers';
import {TokenProps} from '../../../types/tokens';
import {StorageProviderType} from '../../../types/api';
import {notifyToUI, postToFigma} from '../../plugin/notifiers';
import {updateJSONBinTokens} from './providers/jsonbin';

async function updateRemoteTokens({
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
        case StorageProviderType.ARCADE: {
            break;
        }
        default:
            throw new Error('Not implemented');
    }
}

export default async function updateTokensOnSources({
    tokens,
    usedTokenSet,
    updatePageOnly,
    updatedAt,
    shouldUpdateRemote = true,
    isLocal,
}) {
    console.log('update on sources', tokens, usedTokenSet);
    // TODO: FIX THIS
    if (!isLocal && shouldUpdateRemote && !state.editProhibited) {
        updateRemoteTokens({
            provider: state.storageType.provider,
            tokens: reduceToValues(tokens),
            id: state.api.id,
            secret: state.api.secret,
            updatedAt,
            oldUpdatedAt: state.lastUpdatedAt,
        });
    }
    postToFigma({
        type: MessageToPluginTypes.UPDATE,
        tokenValues: reduceToValues(tokens),
        tokens: computeMergedTokens(tokens, usedTokenSet, true),
        updatePageOnly,
    });
}

import {getMergedTokens, reduceToValues} from '@/plugin/tokenHelpers';
import {TokenProps} from '../../../types/tokens';
import {StorageProviderType} from '../../../types/api';
import {postToFigma, notifyToUI} from '../../plugin/notifiers';
import {StateType} from '../../../types/state';
import {MessageToPluginTypes} from '../../../types/messages';
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

export default async function updateTokensOnSources({tokens, updatedAt, shouldUpdateRemote = true}) {
    const isLocal = state.storageType.provider === StorageProviderType.LOCAL;
    if (!isLocal && shouldUpdateRemote && !state.editProhibited) {
        updateRemoteTokens({
            provider: state.storageType.provider,
            tokens: reduceToValues(state.tokens),
            id: state.api.id,
            secret: state.api.secret,
            updatedAt,
            oldUpdatedAt: state.lastUpdatedAt,
        });
    }
}

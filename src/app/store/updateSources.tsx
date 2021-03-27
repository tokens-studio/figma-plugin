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
            console.log('Updating tokens', tokens);
            break;
        }
        default:
            throw new Error('Not implemented');
    }
}

export default async function updateTokensOnSources(state: StateType, updatedAt: string, shouldUpdate = true) {
    const isNotLocalOrArcade = ![StorageProviderType.LOCAL, StorageProviderType.ARCADE].includes(
        state.storageType.provider
    );
    if (isNotLocalOrArcade && shouldUpdate) {
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
    }

    postToFigma({
        type: MessageToPluginTypes.UPDATE,
        tokenValues: state.tokenData.reduceToValues(),
        tokens: state.tokenData.getMergedTokens(),
        updatePageOnly: state.updatePageOnly,
        updatedAt,
    });
}

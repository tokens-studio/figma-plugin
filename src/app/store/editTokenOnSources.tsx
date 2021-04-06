import {StorageProviderType} from '../../../types/api';
import {postToFigma, notifyToUI} from '../../plugin/notifiers';
import {StateType} from '../../../types/state';
import {MessageToPluginTypes} from '../../../types/messages';
import {getMergedTokens} from './TokenContext';

async function updateSingleRemoteToken({
    provider,
    values,
    id,
    secret,
}: {
    provider: StorageProviderType;
    values: object;
    id: string;
    secret: string;
}) {
    notifyToUI('Updating remote...');

    if (!id && !secret) return;

    switch (provider) {
        case StorageProviderType.ARCADE: {
            console.log('Updating tokens', values);

            break;
        }
        default:
            throw new Error('Not implemented');
    }
}

export default async function editRemoteToken(state: StateType, data: {values: object}) {
    const {values} = data;
    updateSingleRemoteToken({
        provider: state.storageType.provider,
        values,
        id: state.api.id,
        secret: state.api.secret,
    });

    postToFigma({
        type: MessageToPluginTypes.UPDATE,
        tokens: getMergedTokens(state.tokens, state.usedTokenSet),
        updatePageOnly: state.updatePageOnly,
    });
}

import {MessageToPluginTypes} from '@types/messages';
import {computeMergedTokens, resolveTokenValues} from '@/plugin/tokenHelpers';
import {TokenProps} from '../../../types/tokens';
import {StorageProviderType} from '../../../types/api';
import {notifyToUI, postToFigma} from '../../plugin/notifiers';
import {updateJSONBinTokens} from './providers/jsonbin';
import {updateURLTokens} from './providers/url';
import {updateGitHubTokens} from './providers/github';

type ContextObject = {
    id: string;
    secret: string;
};

async function updateRemoteTokens({
    provider,
    tokens,
    context,
    updatedAt,
    oldUpdatedAt,
}: {
    provider: StorageProviderType;
    tokens: TokenProps;
    context: ContextObject;
    updatedAt: string;
    oldUpdatedAt?: string;
}) {
    notifyToUI('Updating remote...');

    if (!context) return;

    switch (provider) {
        case StorageProviderType.JSONBIN: {
            updateJSONBinTokens({
                tokens,
                context,
                updatedAt,
                oldUpdatedAt,
            });
            break;
        }
        case StorageProviderType.URL: {
            updateURLTokens({
                tokens,
                context,
                updatedAt,
                oldUpdatedAt,
            });
            break;
        }
        case StorageProviderType.GITHUB: {
            updateGitHubTokens({
                tokens,
                context,
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
    tokenValues,
    usedTokenSet,
    settings,
    updatedAt,
    shouldUpdateRemote = true,
    isLocal,
    editProhibited,
    storageType,
    api,
    lastUpdatedAt,
}) {
    if (!isLocal && shouldUpdateRemote && !editProhibited) {
        updateRemoteTokens({
            provider: storageType.provider,
            tokens,
            context: api,
            updatedAt,
            oldUpdatedAt: lastUpdatedAt,
        });
    }
    const mergedTokens = tokens ? resolveTokenValues(computeMergedTokens(tokens, usedTokenSet)) : null;

    postToFigma({
        type: MessageToPluginTypes.UPDATE,
        tokenValues,
        tokens: tokens ? mergedTokens : null,
        updatedAt,
        settings,
    });
}

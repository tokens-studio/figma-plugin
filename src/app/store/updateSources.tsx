import { MessageToPluginTypes } from '@/types/messages';
import { mergeTokenGroups, resolveTokenValues } from '@/plugin/tokenHelpers';
import { ContextObject, StorageProviderType } from '@/types/api';
import { notifyToUI, postToFigma } from '../../plugin/notifiers';
import { updateJSONBinTokens } from './providers/jsonbin';
import { track } from '@/utils/analytics';
import { TokenValues } from '@/types/tokens';

async function updateRemoteTokens({
  provider,
  tokens,
  context,
  updatedAt,
  oldUpdatedAt,
}: {
  provider: StorageProviderType;
  tokens: TokenValues;
  context: ContextObject;
  updatedAt: string;
  oldUpdatedAt?: string;
}) {
  if (!context) return;
  switch (provider) {
    case StorageProviderType.JSONBIN: {
      track('pushTokens', { provider: StorageProviderType.JSONBIN });

      notifyToUI('Updating JSONBin...');
      updateJSONBinTokens({
        tokens,
        context,
        updatedAt,
        oldUpdatedAt,
      });
      break;
    }

    case StorageProviderType.GITHUB: {
      break;
    }
    case StorageProviderType.GITLAB: {
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
  if (tokens && !isLocal && shouldUpdateRemote && !editProhibited) {
    updateRemoteTokens({
      provider: storageType.provider,
      tokens,
      context: api,
      updatedAt,
      oldUpdatedAt: lastUpdatedAt,
    });
  }
  const mergedTokens = tokens ? resolveTokenValues(mergeTokenGroups(tokens, usedTokenSet)) : null;

  postToFigma({
    type: MessageToPluginTypes.UPDATE,
    tokenValues,
    tokens: tokens ? mergedTokens : null,
    updatedAt,
    settings,
    usedTokenSet,
  });
}

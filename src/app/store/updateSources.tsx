import { MessageToPluginTypes } from '@/types/messages';
import { mergeTokenGroups, resolveTokenValues } from '@/plugin/tokenHelpers';
import { ContextObject, StorageProviderType, StorageType } from '@/types/api';
import { notifyToUI, postToFigma } from '../../plugin/notifiers';
import { updateJSONBinTokens } from './providers/jsonbin';
import { track } from '@/utils/analytics';
import type { AnyTokenSet, SingleToken } from '@/types/tokens';
import type { UsedTokenSetsMap } from '@/types';
import type { SettingsState } from './models/settings';

type UpdateRemoteTokensPayload = {
  provider: StorageProviderType;
  tokens: Record<string, SingleToken[]>;
  context: ContextObject;
  updatedAt: string;
  oldUpdatedAt?: string;
};

type UpdateTokensOnSourcesPayload = {
  tokens: Record<string, SingleToken[]>;
  tokenValues: AnyTokenSet;
  usedTokenSet: UsedTokenSetsMap;
  settings: SettingsState;
  updatedAt: string;
  shouldUpdateRemote: boolean;
  isLocal: boolean;
  editProhibited: boolean;
  storageType: StorageType;
  lastUpdatedAt: string;
  api: ContextObject;
};

async function updateRemoteTokens({
  provider,
  tokens,
  context,
  updatedAt,
  oldUpdatedAt,
}: UpdateRemoteTokensPayload) {
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
}: UpdateTokensOnSourcesPayload) {
  if (tokens && !isLocal && shouldUpdateRemote && !editProhibited) {
    updateRemoteTokens({
      provider: storageType.provider,
      tokens,
      context: api,
      updatedAt,
      oldUpdatedAt: lastUpdatedAt,
    });
  }

  const mergedTokens = tokens
    ? resolveTokenValues(mergeTokenGroups(tokens, usedTokenSet))
    : null;
  postToFigma({
    type: MessageToPluginTypes.UPDATE,
    tokenValues,
    tokens: tokens ? mergedTokens : null,
    updatedAt,
    settings,
    usedTokenSet,
  });
}

import { mergeTokenGroups, resolveTokenValues } from '@/plugin/tokenHelpers';
import { Dispatch } from '@/app/store';
import { notifyToUI } from '../../plugin/notifiers';
import { updateJSONBinTokens } from './providers/jsonbin';
import { updateGenericVersionedTokens } from './providers/generic/versionedStorage';
import { track } from '@/utils/analytics';
import type { AnyTokenList } from '@/types/tokens';
import type { ThemeObjectsList, UsedTokenSetsMap } from '@/types';
import type { SettingsState } from './models/settings';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageType, StorageTypeCredentials } from '@/types/StorageType';

type UpdateRemoteTokensPayload = {
  provider: StorageProviderType;
  tokens: Record<string, AnyTokenList>;
  themes: ThemeObjectsList;
  context: StorageTypeCredentials;
  updatedAt: string;
  oldUpdatedAt?: string;
  dispatch: Dispatch
};

type UpdateTokensOnSourcesPayload = {
  tokens: Record<string, AnyTokenList> | null;
  tokenValues: Record<string, AnyTokenList>;
  usedTokenSet: UsedTokenSetsMap;
  themes: ThemeObjectsList;
  activeTheme: Record<string, string>;
  settings: SettingsState;
  updatedAt: string;
  shouldUpdateRemote: boolean;
  isLocal: boolean;
  editProhibited: boolean;
  storageType: StorageType;
  lastUpdatedAt: string;
  api: StorageTypeCredentials;
  checkForChanges: boolean;
  shouldSwapStyles?: boolean;
  collapsedTokenSets: string[];
  dispatch: Dispatch
};

async function updateRemoteTokens({
  provider,
  tokens,
  themes,
  context,
  updatedAt,
  oldUpdatedAt,
  dispatch,
}: UpdateRemoteTokensPayload) {
  if (!context) return;
  switch (provider) {
    case StorageProviderType.JSONBIN: {
      track('pushTokens', { provider: StorageProviderType.JSONBIN });

      notifyToUI('Updating JSONBin...');
      await updateJSONBinTokens({
        themes,
        tokens,
        context,
        updatedAt,
        oldUpdatedAt,
        dispatch,
      });
      break;
    }
    case StorageProviderType.GENERIC_VERSIONED_STORAGE: {
      track('pushTokens', { provider: StorageProviderType.GENERIC_VERSIONED_STORAGE });
      notifyToUI('Updating Generic Remote...');
      await updateGenericVersionedTokens({
        themes,
        tokens,
        context,
        updatedAt,
        oldUpdatedAt,
        dispatch,
      });

      break;
    }
    case StorageProviderType.GITHUB: {
      break;
    }
    case StorageProviderType.GITLAB: {
      break;
    }
    case StorageProviderType.BITBUCKET: {
      break;
    }
    case StorageProviderType.ADO: {
      break;
    }
    case StorageProviderType.SUPERNOVA: {
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
  themes,
  activeTheme,
  settings,
  updatedAt,
  shouldUpdateRemote = true,
  isLocal,
  editProhibited,
  storageType,
  api,
  lastUpdatedAt,
  checkForChanges,
  shouldSwapStyles,
  collapsedTokenSets,
  dispatch,
}: UpdateTokensOnSourcesPayload) {
  if (tokenValues && !isLocal && shouldUpdateRemote && !editProhibited) {
    updateRemoteTokens({
      provider: storageType.provider,
      tokens: tokenValues,
      themes,
      context: api,
      updatedAt,
      oldUpdatedAt: lastUpdatedAt,
      dispatch,
    });
  }

  const mergedTokens = tokens
    ? resolveTokenValues(mergeTokenGroups(tokens, usedTokenSet))
    : null;
  AsyncMessageChannel.ReactInstance.message({
    type: AsyncMessageTypes.UPDATE,
    tokenValues,
    tokens: tokens ? mergedTokens : null,
    themes,
    updatedAt,
    settings,
    usedTokenSet,
    checkForChanges,
    activeTheme,
    shouldSwapStyles,
    collapsedTokenSets,
  });
}

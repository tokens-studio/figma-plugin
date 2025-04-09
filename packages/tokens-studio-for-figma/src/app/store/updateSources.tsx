import { startTransaction } from '@sentry/react';
import { mergeTokenGroups } from '@/utils/tokenHelpers';
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
import { defaultTokenResolver } from '@/utils/TokenResolver';
import { getFormat, TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import { exceedsStorageLimit } from '@/utils/sizeCheck';

type UpdateRemoteTokensPayload = {
  provider: StorageProviderType;
  tokens: Record<string, AnyTokenList>;
  themes: ThemeObjectsList;
  context: StorageTypeCredentials;
  updatedAt: string;
  oldUpdatedAt?: string;
  storeTokenIdInJsonEditor: boolean;
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
  storeTokenIdInJsonEditor: boolean
  dispatch: Dispatch
  tokenFormat: TokenFormatOptions
};

async function updateRemoteTokens({
  provider,
  tokens,
  themes,
  context,
  updatedAt,
  oldUpdatedAt,
  storeTokenIdInJsonEditor,
  dispatch,
}: UpdateRemoteTokensPayload) {
  if (!context) return;
  const setCount = Object.keys(tokens)?.length;
  const tokensCount = Object.values(tokens).reduce((acc, set) => acc + set.length, 0);
  const themeCount = Object.keys(themes).length;
  const tokenFormat = getFormat();
  switch (provider) {
    case StorageProviderType.JSONBIN: {
      notifyToUI('Updating JSONBin...');
      await updateJSONBinTokens({
        themes,
        tokens,
        context,
        updatedAt,
        oldUpdatedAt,
        storeTokenIdInJsonEditor,
        dispatch,
      });
      track('pushTokens', {
        provider: StorageProviderType.JSONBIN, setCount, tokensCount, themeCount, tokenFormat,
      });

      break;
    }
    case StorageProviderType.GENERIC_VERSIONED_STORAGE: {
      notifyToUI('Updating Generic Remote...');
      await updateGenericVersionedTokens({
        themes,
        tokens,
        context,
        updatedAt,
        oldUpdatedAt,
        storeTokenIdInJsonEditor,
        dispatch,
      });

      track('pushTokens', {
        provider: StorageProviderType.GENERIC_VERSIONED_STORAGE, setCount, tokensCount, themeCount, tokenFormat,
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
    case StorageProviderType.TOKENS_STUDIO: {
      break;
    }
    default:
      throw new Error(`Unimplemented storage provider for ${provider}`);
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
  storeTokenIdInJsonEditor,
  dispatch,
  tokenFormat,
}: UpdateTokensOnSourcesPayload) {
  if (tokenValues && !isLocal && shouldUpdateRemote && !editProhibited) {
    updateRemoteTokens({
      provider: storageType.provider,
      tokens: tokenValues,
      themes,
      context: api,
      updatedAt,
      oldUpdatedAt: lastUpdatedAt,
      storeTokenIdInJsonEditor,
      dispatch,
    });
  }

  const mergedTokens = tokens
    ? defaultTokenResolver.setTokens(mergeTokenGroups(tokens, usedTokenSet))
    : null;

  // Check if we should use client storage
  let useClientStorage = false;

  // For local storage, check size before sending to plugin
  if (isLocal) {
    try {
      // Get the current state to check if user is already using client storage
      const state = dispatch.getState();
      const alreadyUsingClientStorage = state.uiState.useClientStorageForLocal;

      // Check if token values exceed the storage limit
      if (exceedsStorageLimit(tokenValues)) {
        // Storage limit exceeded, use client storage
        useClientStorage = true;

        // Only show warning if not already using client storage
        if (!alreadyUsingClientStorage) {
          // Set the flag in UI state to trigger the warning dialog
          dispatch.uiState.setStorageLimitExceeded(true);
        }
      } else {
        // Not exceeding limit, but check if user has chosen to use client storage
        useClientStorage = alreadyUsingClientStorage;
        dispatch.uiState.setStorageLimitExceeded(false);
      }
    } catch (error) {
      // If there's an error checking the size, use client storage to be safe
      useClientStorage = true;
    }
  } else {
    // For remote storage, always use client storage
    useClientStorage = true;
  }

  const transaction = startTransaction({
    op: 'transaction',
    name: 'Update Tokens',
  });
  AsyncMessageChannel.ReactInstance.message({
    type: AsyncMessageTypes.UPDATE,
    tokenValues,
    tokens: mergedTokens,
    themes,
    updatedAt,
    settings,
    usedTokenSet,
    checkForChanges,
    activeTheme,
    shouldSwapStyles,
    collapsedTokenSets,
    tokenFormat,
    useClientStorage,
  }).then((result) => {
    if (transaction) {
      transaction.setMeasurement('nodes', result.nodes, '');
      transaction.finish();
    }
  });
}

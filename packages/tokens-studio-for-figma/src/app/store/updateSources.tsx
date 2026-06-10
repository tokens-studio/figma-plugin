import { startTransaction } from '@sentry/react';
import { mergeTokenGroups, mergeServerResolvedTokens } from '@/utils/tokenHelpers';

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
  compressedTokens: string;
  tokenValues: Record<string, AnyTokenList>;
  usedTokenSet: UsedTokenSetsMap;
  themes: ThemeObjectsList;
  compressedThemes: string;
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
  tokensSize: number
  themesSize: number
  /** Flat map of tokenName → resolved value from the Studio gRPC server (theme delta only). */
  serverResolvedTokens?: Record<string, string> | null;
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
    case StorageProviderType.TOKENS_STUDIO:
    case StorageProviderType.TOKENS_STUDIO_OAUTH: {
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
  compressedTokens,
  compressedThemes,
  serverResolvedTokens,
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

  // Always run local resolution to get the complete token list.
  const locallyResolved = tokens
    ? defaultTokenResolver.setTokens(mergeTokenGroups(tokens, usedTokenSet))
    : null;

  // If the server returned theme-specific overrides, merge them on top.
  // The server delta takes precedence for the tokens it resolved; all other
  // tokens retain their locally-resolved values.
  const mergedTokens = locallyResolved
    ? mergeServerResolvedTokens(locallyResolved, serverResolvedTokens)
    : null;



  const tokensSize = (compressedTokens.length / 1024) * 2; // UTF-16 uses 2 bytes per character
  const themesSize = (compressedThemes.length / 1024) * 2;

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
    storageProvider: storageType.provider,
    storageSize: (tokensSize + themesSize),
    compressedTokens,
    compressedThemes,
  }).then((result) => {
    if (transaction) {
      transaction.setMeasurement('nodes', result.nodes, '');
      transaction.finish();
    }
  });
}

import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { Dispatch } from '@/app/store';
import { notifyToUI } from '../../../plugin/notifiers';
import * as pjs from '../../../../package.json';
import useStorage from '../useStorage';
import { compareUpdatedAt } from '@/utils/date';
import {
  activeThemeSelector, themesListSelector, tokensSelector, usedTokenSetSelector,
} from '@/selectors';
import { UpdateRemoteFunctionPayload } from '@/types/UpdateRemoteFunction';
import { JSONBinTokenStorage } from '@/storage';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import { RemoteResponseData } from '@/types/RemoteResponseData';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { saveLastSyncedState } from '@/utils/saveLastSyncedState';

export async function updateJSONBinTokens({
  tokens, themes, context, updatedAt, oldUpdatedAt = null,
}: UpdateRemoteFunctionPayload) {
  const { id, secret } = context;
  try {
    if (!id || !secret) throw new Error('Missing JSONBin ID or secret');

    const storage = new JSONBinTokenStorage(id, secret);

    const payload = {
      tokens,
      themes,
      metadata: {
        updatedAt: updatedAt ?? new Date().toISOString(),
        version: pjs.plugin_version,
      },
    };

    if (oldUpdatedAt) {
      const remoteTokens = await storage.retrieve();
      if (remoteTokens?.status === 'failure') {
        console.log('Error updating jsonbin', remoteTokens?.errorMessage);
        return {
          status: 'failure',
          errorMessage: remoteTokens?.errorMessage,
        };
      }
      const comparison = await compareUpdatedAt(oldUpdatedAt, remoteTokens?.metadata?.updatedAt ?? '');
      if (comparison === 'remote_older') {
        storage.save(payload);
      } else {
        // Tell the user to choose between:
        // A) Pull Remote values and replace local changes
        // B) Overwrite Remote changes
        notifyToUI('Error updating tokens as remote is newer, please update first', { error: true });
      }
    } else {
      storage.save(payload);
    }
  } catch (e) {
    console.log('Error updating jsonbin', e);
  }
}

export function useJSONbin() {
  const dispatch = useDispatch<Dispatch>();
  const { setStorageType } = useStorage();
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const usedTokenSets = useSelector(usedTokenSetSelector);

  const createNewJSONBin = useCallback(async (context: Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.JSONBIN }>) => {
    const { secret, name, internalId } = context;
    const updatedAt = new Date().toISOString();
    const result = await JSONBinTokenStorage.create(name, updatedAt, secret);
    if (result) {
      updateJSONBinTokens({
        tokens,
        context: {
          id: result.metadata.id,
          secret,
        },
        themes,
        updatedAt,
      });
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.CREDENTIALS,
        credential: {
          provider: StorageProviderType.JSONBIN,
          id: result.metadata.id,
          internalId,
          name,
          secret,
        },
      });
      dispatch.uiState.setProjectURL(`https://jsonbin.io/${result.metadata.id}`);

      return result.metadata.id;
    }
    notifyToUI('Something went wrong. See console for details', { error: true });
    return null;
  }, [dispatch, themes, tokens]);

  // Read tokens from JSONBin
  const pullTokensFromJSONBin = useCallback(async (context: Extract<StorageTypeCredentials, { provider: StorageProviderType.JSONBIN }>): Promise<RemoteResponseData | null> => {
    const {
      id, secret, name, internalId,
    } = context;
    if (!id || !secret) {
      return {
        status: 'failure',
        errorMessage: ErrorMessages.ID_NON_EXIST_ERROR,
      };
    }
    try {
      const storage = new JSONBinTokenStorage(id, secret);
      const data = await storage.retrieve();
      dispatch.uiState.setProjectURL(`https://jsonbin.io/${id}`);

      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.CREDENTIALS,
        credential: {
          id,
          internalId,
          name,
          secret,
          provider: StorageProviderType.JSONBIN,
        },
      });
      if (data?.status === 'failure') {
        return {
          status: 'failure',
          errorMessage: data.errorMessage,
        };
      }
      if (data?.metadata && data?.tokens) {
        dispatch.tokenState.setEditProhibited(false);

        return data;
      }
      notifyToUI('No tokens stored on remote', { error: true });
      return null;
    } catch (e) {
      notifyToUI(ErrorMessages.JSONBIN_CREDENTIAL_ERROR, { error: true });
      console.log('Error:', e);
      return {
        status: 'failure',
        errorMessage: ErrorMessages.JSONBIN_CREDENTIAL_ERROR,
      };
    }
  }, [dispatch]);

  const addJSONBinCredentials = useCallback(async (context: Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.JSONBIN }>): Promise<RemoteResponseData | null> => {
    const {
      provider, id, name, secret, internalId,
    } = context;
    if (!id || !secret) {
      return {
        status: 'failure',
        errorMessage: ErrorMessages.ID_NON_EXIST_ERROR,
      };
    }

    const content = await pullTokensFromJSONBin({
      provider,
      id,
      name,
      secret,
      internalId,
    });
    if (content?.status === 'failure') {
      return {
        status: 'failure',
        errorMessage: content.errorMessage,
      };
    }
    if (content) {
      dispatch.uiState.setApiData({
        provider, id, name, secret, internalId,
      });
      setStorageType({
        provider: {
          provider, id, name, internalId,
        },
        shouldSetInDocument: true,
      });
      saveLastSyncedState(dispatch, content.tokens, content.themes, {});
      dispatch.tokenState.setTokenData({
        values: content.tokens,
        themes: content.themes,
        usedTokenSet: usedTokenSets,
        activeTheme,
      });
      return content;
    }
    return content;
  }, [
    dispatch,
    pullTokensFromJSONBin,
    setStorageType,
    usedTokenSets,
    activeTheme,
  ]);

  return useMemo(() => ({
    addJSONBinCredentials,
    pullTokensFromJSONBin,
    createNewJSONBin,
  }), [
    addJSONBinCredentials,
    pullTokensFromJSONBin,
    createNewJSONBin,
  ]);
}

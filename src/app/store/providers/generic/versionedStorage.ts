import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { Dispatch } from '@/app/store';
import { notifyToUI } from '../../../../plugin/notifiers';
import * as pjs from '../../../../../package.json';
import useStorage from '../../useStorage';
import { compareUpdatedAt } from '@/utils/date';
import {
  activeThemeSelector, themesListSelector, tokensSelector, usedTokenSetSelector,
} from '@/selectors';
import { UpdateRemoteFunctionPayload } from '@/types/UpdateRemoteFunction';
import { GenericVersionedStorage } from '@/storage';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';

export async function updateGenericVersionedTokens({
  tokens, themes, context, updatedAt, oldUpdatedAt = null,
}: UpdateRemoteFunctionPayload) {
  const { id, additionalHeaders } = context;
  try {
    if (!id) throw new Error('Missing Generic Versioned Storage ID ');

    const storage = new GenericVersionedStorage(id, additionalHeaders);

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

export function useGenericVersionedStorage() {
  const dispatch = useDispatch<Dispatch>();
  const { setStorageType } = useStorage();
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const usedTokenSets = useSelector(usedTokenSetSelector);

  const createNewGenericVersionedStorage = useCallback(async (context: Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.GENERIC_VERSIONED_STORAGE }>) => {
    const { id, name, additionalHeaders, internalId } = context;
    const updatedAt = new Date().toISOString();
    const result = await GenericVersionedStorage.create(id, updatedAt, additionalHeaders);
    if (result) {
      updateGenericVersionedTokens({
        tokens,
        context: {
          id,
          additionalHeaders,
        },
        themes,
        updatedAt,
      });
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.CREDENTIALS,
        credential: {
          provider: StorageProviderType.GENERIC_VERSIONED_STORAGE,
          id,
          internalId,
          name,
          additionalHeaders,
        },
      });
      dispatch.uiState.setProjectURL(id);

      return result.metadata.id;
    }
    notifyToUI('Something went wrong. See console for details', { error: true });
    return null;
  }, [dispatch, themes, tokens]);

  // Read tokens from JSONBin
  const pullTokensFromGenericVersionedStorage = useCallback(async (context: Extract<StorageTypeCredentials, { provider: StorageProviderType.GENERIC_VERSIONED_STORAGE }>) => {
    const {
      id, additionalHeaders, name, internalId,
    } = context;
    if (!id) return null;
    try {
      const storage = new GenericVersionedStorage(id, additionalHeaders);
      const data = await storage.retrieve();
      dispatch.uiState.setProjectURL(id);

      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.CREDENTIALS,
        credential: {
          internalId,
          name,
          id,
          additionalHeaders,
          provider: StorageProviderType.GENERIC_VERSIONED_STORAGE,
        },
      });

      if (data?.metadata && data?.tokens) {
        dispatch.tokenState.setEditProhibited(false);

        return data;
      }
      notifyToUI('No tokens stored on remote', { error: true });
      return null;
    } catch (e) {
      notifyToUI('Error fetching from Generic Versioned Storage, check console (F12)', { error: true });
      console.log('Error:', e);
      return null;
    }
  }, [dispatch]);

  const addGenericVersionedCredentials = useCallback(async (context: Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.GENERIC_VERSIONED_STORAGE }>) => {
    const {
      provider, id, name, additionalHeaders, internalId,
    } = context;
    if (!id) return null;

    const content = await pullTokensFromGenericVersionedStorage({
      provider,
      name,
      id,
      additionalHeaders,
      internalId,
    });
    if (content) {
      dispatch.uiState.setApiData({
        provider, id, name, additionalHeaders, internalId,
      });
      setStorageType({
        provider: {
          provider, id, additionalHeaders, name, internalId,
        },
        shouldSetInDocument: true,
      });
      dispatch.tokenState.setLastSyncedState(JSON.stringify([content.tokens, content.themes], null, 2));
      dispatch.tokenState.setTokenData({
        values: content.tokens,
        themes: content.themes,
        usedTokenSet: usedTokenSets,
        activeTheme,
      });
    }

    return content;
  }, [
    dispatch,
    pullTokensFromGenericVersionedStorage,
    setStorageType,
    usedTokenSets,
    activeTheme,
  ]);

  return useMemo(() => ({
    addGenericVersionedCredentials,
    pullTokensFromGenericVersionedStorage,
    createNewGenericVersionedStorage,
  }), [
    addGenericVersionedCredentials,
    pullTokensFromGenericVersionedStorage,
    createNewGenericVersionedStorage,
  ]);
}

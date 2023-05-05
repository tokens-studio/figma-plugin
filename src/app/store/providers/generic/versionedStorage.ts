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
import { GenericVersionedMeta, GenericVersionedStorage } from '@/storage';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import {
  StorageTypeCredentials,
  StorageTypeFormValues,
  GenericVersionedStorageFlow,
  GenericVersionedStorageType,
} from '@/types/StorageType';
import { RemoteResponseData } from '@/types/RemoteResponseData';
import { saveLastSyncedState } from '@/utils/saveLastSyncedState';
import { ErrorMessages } from '@/constants/ErrorMessages';

export async function updateGenericVersionedTokens({
  tokens,
  themes,
  context,
  updatedAt,
  oldUpdatedAt = null,
  dispatch,
}: UpdateRemoteFunctionPayload): Promise<RemoteResponseData<GenericVersionedMeta> | null> {
  const { id, additionalHeaders, flow } = context as GenericVersionedStorageType;

  try {
    if (!id) throw new Error('Missing Generic Versioned Storage ID');

    // Read Only is not allowed to save to external
    if (flow === GenericVersionedStorageFlow.READ_ONLY) return null;

    const storage = new GenericVersionedStorage(id, flow, additionalHeaders);
    const tokenSetOrder = Object.keys(tokens);
    const payload = {
      tokens,
      themes,
      metadata: {
        tokenSetOrder,
        updatedAt: updatedAt ?? new Date().toISOString(),
        version: pjs.plugin_version,
      },
    };

    if (oldUpdatedAt) {
      const remoteTokens = await storage.retrieve();

      if (remoteTokens?.status === 'failure') {
        // eslint-disable-next-line no-console
        const errorMessage = remoteTokens?.errorMessage || ErrorMessages.GENERAL_CONNECTION_ERROR;
        notifyToUI('Error updating Generic Storage, check console (F12) ', { error: true });
        console.error('Error updating Generic storage', errorMessage);
        return {
          status: 'failure',
          errorMessage,
        };
      }

      const comparison = await compareUpdatedAt(oldUpdatedAt, remoteTokens?.metadata?.updatedAt ?? '');

      if (comparison === 'remote_newer') {
        notifyToUI('Error updating tokens as remote is newer, please update first', { error: true });
        return {
          status: 'failure',
          errorMessage: ErrorMessages.REMOTE_VERSION_NEWER,
        };
      }
    }

    // If the oldUpdatedAt doesn't exist, we still save the tokens
    // This happens in createNewGenericVersionedStorage
    const success = await storage.save(payload);

    if (success) {
      saveLastSyncedState(dispatch, payload.tokens, payload.themes, { tokenSetOrder });
      return {
        status: 'success',
        ...payload,
      };
    }

    // eslint-disable-next-line no-console
    notifyToUI('Error updating Generic Storage, check console (F12) ', { error: true });
    console.error('Error updating Generic storage');
    return {
      status: 'failure',
      errorMessage: ErrorMessages.REMOTE_CREDENTIAL_ERROR,
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    notifyToUI('Error updating Generic Storage, check console (F12) ', { error: true });
    console.error('Error updating Generic Storage', e);
    return {
      status: 'failure',
      errorMessage: String(e),
    };
  }
}

export function useGenericVersionedStorage() {
  const dispatch = useDispatch<Dispatch>();
  const { setStorageType } = useStorage();
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const usedTokenSets = useSelector(usedTokenSetSelector);

  const createNewGenericVersionedStorage = useCallback(
    async (
      context: Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.GENERIC_VERSIONED_STORAGE }>,
    ) => {
      const {
        id, name, additionalHeaders, internalId, flow,
      } = context;
      const updatedAt = new Date().toISOString();
      const result = await GenericVersionedStorage.create(id, updatedAt, flow, additionalHeaders);
      if (result) {
        updateGenericVersionedTokens({
          tokens,
          context: {
            id,
            additionalHeaders,
            flow,
          },
          themes,
          updatedAt,
          dispatch,
        });
        AsyncMessageChannel.ReactInstance.message({
          type: AsyncMessageTypes.CREDENTIALS,
          credential: {
            provider: StorageProviderType.GENERIC_VERSIONED_STORAGE,
            id,
            flow,
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
    },
    [dispatch, themes, tokens],
  );

  // Read tokens from endpoint
  const pullTokensFromGenericVersionedStorage = useCallback(
    async (
      context: Extract<StorageTypeCredentials, { provider: StorageProviderType.GENERIC_VERSIONED_STORAGE }>,
    ): Promise<RemoteResponseData | null> => {
      const {
        id, additionalHeaders, name, internalId, flow,
      } = context;
      if (!id) return null;
      try {
        const storage = new GenericVersionedStorage(id, flow, additionalHeaders);
        const data = await storage.retrieve();
        dispatch.uiState.setProjectURL(id);

        AsyncMessageChannel.ReactInstance.message({
          type: AsyncMessageTypes.CREDENTIALS,
          credential: {
            internalId,
            name,
            id,
            flow,
            additionalHeaders,
            provider: StorageProviderType.GENERIC_VERSIONED_STORAGE,
          },
        });
        if (data?.status === 'failure') {
          notifyToUI('Error fetching from Generic Versioned Storage, check console (F12)', { error: true });
          console.error('Error:', data);
          return {
            status: 'failure',
            errorMessage: data.errorMessage,
          };
        }
        if (data?.metadata && data?.tokens) {
          dispatch.tokenState.setEditProhibited(false);
          return {
            ...data,
            metadata: {
              // Define a fallback
              tokenSetOrder: Object.keys(data.tokens),
              ...data.metadata,
            },
          };
        }
        notifyToUI('No tokens stored on remote', { error: true });
        return null;
      } catch (e) {
        notifyToUI('Error fetching from Generic Versioned Storage, check console (F12)', { error: true });
        console.error('Error:', e);
        return null;
      }
    },
    [dispatch],
  );

  const addGenericVersionedCredentials = useCallback(
    async (
      context: Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.GENERIC_VERSIONED_STORAGE }>,
    ): Promise<RemoteResponseData | null> => {
      const {
        provider, id, name, additionalHeaders, internalId, flow,
      } = context;
      if (!id) return null;

      // Always attempt create first if required
      const updatedAt = new Date().toISOString();
      const result = await GenericVersionedStorage.create(id, updatedAt, flow, additionalHeaders);

      if (!result) {
        return {
          status: 'failure',
          errorMessage: 'Failed to create endpoint',
        };
      }

      const content = await pullTokensFromGenericVersionedStorage(context);

      if (content?.status === 'failure') {
        return {
          status: 'failure',
          errorMessage: content.errorMessage,
        };
      }
      if (content) {
        dispatch.uiState.setApiData({
          provider,
          id,
          name,
          additionalHeaders,
          internalId,
          flow,
        });
        setStorageType({
          provider: {
            provider,
            id,
            additionalHeaders,
            name,
            internalId,
            flow,
          },
          shouldSetInDocument: true,
        });
        saveLastSyncedState(dispatch, content.tokens, content?.themes, content.metadata);
        dispatch.tokenState.setTokenData({
          values: content.tokens,
          themes: content.themes,
          usedTokenSet: usedTokenSets,
          activeTheme,
        });
        return content;
      }

      return content;
    },
    [dispatch, pullTokensFromGenericVersionedStorage, setStorageType, usedTokenSets, activeTheme],
  );

  return useMemo(
    () => ({
      addGenericVersionedCredentials,
      pullTokensFromGenericVersionedStorage,
      createNewGenericVersionedStorage,
    }),
    [addGenericVersionedCredentials, pullTokensFromGenericVersionedStorage, createNewGenericVersionedStorage],
  );
}

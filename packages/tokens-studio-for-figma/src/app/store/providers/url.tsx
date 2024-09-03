import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import compact from 'just-compact';
import type { StorageProviderType } from '@sync-providers/types';
import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import { Dispatch } from '@/app/store';
import { notifyToUI } from '../../../plugin/notifiers';
import { UrlTokenStorage } from '@/storage/UrlTokenStorage';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageTypeCredentials } from '@/types/StorageType';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { activeThemeSelector, usedTokenSetSelector } from '@/selectors';
import { RemoteResponseData } from '@/types/RemoteResponseData';
import { applyTokenSetOrder } from '@/utils/tokenset';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';

type UrlCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.URL; }>;

export default function useURL() {
  const dispatch = useDispatch<Dispatch>();
  const activeTheme = useSelector(activeThemeSelector);
  const usedTokenSets = useSelector(usedTokenSetSelector);

  const storageClientFactory = useCallback((context: UrlCredentials) => (
    new UrlTokenStorage(context.id, context.secret)
  ), []);

  // Read tokens from URL
  const pullTokensFromURL = useCallback(async (context: UrlCredentials): Promise<RemoteResponseData | null> => {
    const {
      id, secret, name, internalId,
    } = context;
    if (!id && !secret) {
      return {
        status: 'failure',
        errorMessage: ErrorMessages.ID_NON_EXIST_ERROR,
      };
    }
    const storage = storageClientFactory(context);

    try {
      const content = await storage.retrieve();
      dispatch.uiState.setProjectURL(id);
      if (content?.status === 'failure') {
        return {
          status: 'failure',
          errorMessage: content.errorMessage,
        };
      }
      if (content) {
        AsyncMessageChannel.ReactInstance.message({
          type: AsyncMessageTypes.CREDENTIALS,
          credential: {
            id,
            internalId,
            name,
            secret,
            provider: AVAILABLE_PROVIDERS.URL as StorageProviderType.URL,
          },
        });

        if (Object.keys(content.tokens).length) {
          dispatch.tokenState.setTokenData({
            values: applyTokenSetOrder(content.tokens, content.metadata?.tokenSetOrder),
            themes: content.themes,
            usedTokenSet: usedTokenSets,
            activeTheme,
          });
          dispatch.tokenState.setRemoteData({
            tokens: applyTokenSetOrder(content.tokens, content.metadata?.tokenSetOrder),
            themes: content.themes,
            metadata: content.metadata,
          });
          const stringifiedRemoteTokens = JSON.stringify(compact([applyTokenSetOrder(content.tokens, content.metadata?.tokenSetOrder), content.themes, TokenFormat.format]), null, 2);
          dispatch.tokenState.setLastSyncedState(stringifiedRemoteTokens);
          dispatch.tokenState.setEditProhibited(true);
          return content;
        }
        notifyToUI('No tokens stored on remote', { error: true });
      }
    } catch (err) {
      notifyToUI(ErrorMessages.URL_CREDENTIAL_ERROR, { error: true });
      console.log('Error:', err);
      return {
        status: 'failure',
        errorMessage: ErrorMessages.URL_CREDENTIAL_ERROR,
      };
    }
    return null;
  }, [
    dispatch,
    storageClientFactory,
    activeTheme,
    usedTokenSets,
  ]);

  return useMemo(() => ({
    pullTokensFromURL,
  }), [
    pullTokensFromURL,
  ]);
}

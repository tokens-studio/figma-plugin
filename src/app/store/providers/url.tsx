import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { Dispatch } from '@/app/store';
import { notifyToUI } from '../../../plugin/notifiers';
import { UrlTokenStorage } from '@/storage/UrlTokenStorage';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageTypeCredentials } from '@/types/StorageType';
import { activeThemeSelector, usedTokenSetSelector } from '@/selectors';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { RemoteResponseData } from '@/types/RemoteResponseData';
import { applyTokenSetOrder } from '@/utils/tokenset';

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
            provider: StorageProviderType.URL,
          },
        });

        if (Object.keys(content.tokens).length) {
          dispatch.tokenState.setTokenData({
            values: applyTokenSetOrder(content.tokens, content.metadata?.tokenSetOrder),
            themes: content.themes,
            usedTokenSet: usedTokenSets,
            activeTheme,
          });
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
    usedTokenSets,
    activeTheme,
  ]);

  return useMemo(() => ({
    pullTokensFromURL,
  }), [
    pullTokensFromURL,
  ]);
}

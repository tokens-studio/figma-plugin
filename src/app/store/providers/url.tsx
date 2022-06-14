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

type UrlCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.URL; }>;

export default function useURL() {
  const dispatch = useDispatch<Dispatch>();
  const activeTheme = useSelector(activeThemeSelector);
  const usedTokenSets = useSelector(usedTokenSetSelector);

  const storageClientFactory = useCallback((context: UrlCredentials) => (
    new UrlTokenStorage(context.id, context.secret)
  ), []);

  // Read tokens from URL
  const pullTokensFromURL = useCallback(async (context: UrlCredentials) => {
    const {
      id, secret, name, internalId,
    } = context;
    if (!id && !secret) return null;
    console.log(context);
    const storage = storageClientFactory(context);

    try {
      const content = await storage.retrieve();
      dispatch.uiState.setProjectURL(id);

      if (content) {
        AsyncMessageChannel.message({
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
            values: content.tokens,
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
      notifyToUI('Error fetching from URL, check console (F12)', { error: true });
      console.log('Error:', err);
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

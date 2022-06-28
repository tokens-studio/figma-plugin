import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { Dispatch } from '@/app/store';
import useConfirm from '@/app/hooks/useConfirm';
import { notifyToUI } from '@/plugin/notifiers';
import {
  activeThemeSelector,
  themesListSelector, tokensSelector, usedTokenSetSelector,
} from '@/selectors';
import { isEqual } from '@/utils/isEqual';
import { RemoteTokenStorageData } from '@/storage/RemoteTokenStorage';
import { SupernovaStorageMetadata } from '@/storage/GitTokenStorage';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { SupernovaTokenStorage } from '../../../../storage/SupernovaTokenStorage';

type SupernovaCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.SUPERNOVA }>;
type SupernovaFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.SUPERNOVA }>;

export function useSupernova() {
  const tokens = useSelector(tokensSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const themes = useSelector(themesListSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const dispatch = useDispatch<Dispatch>();
  const { confirm } = useConfirm();

  const storageClientFactory = useCallback((context: SupernovaCredentials) => {
    const storageClient = new SupernovaTokenStorage(context.id, context.secret);
    return storageClient;
  }, []);

  const askUserIfPull = useCallback(async () => {
    const confirmResult = await confirm({
      text: 'Pull from Supernova?',
      description: 'Your design system already contains tokens, do you want to pull these now?',
    });
    if (confirmResult === false) return false;
    return confirmResult.result;
  }, [confirm]);

  const pushToSupernova = useCallback(async (context: SupernovaCredentials): Promise<RemoteTokenStorageData<SupernovaStorageMetadata> | null> => {
    const storage = storageClientFactory(context);
    const content = await storage.retrieve();

    if (content) {
      if (
        content
        && isEqual(content.tokens, tokens)
        && isEqual(content.themes, themes)
      ) {
        notifyToUI('Nothing to commit');
        return {
          tokens,
          themes,
          metadata: {},
        };
      }
    }

    // TODO: Push to Supernova API

    return {
      tokens,
      themes,
      metadata: {},
    };
  }, [storageClientFactory, themes, tokens]);

  const pullFromSupernova = useCallback(async (context: SupernovaCredentials) => {
    const storage = storageClientFactory(context);

    try {
      const content = await storage.retrieve();
      if (content) {
        return content;
      }
    } catch (e) {
      console.log('Error', e);
    }
    return null;
  }, [
    storageClientFactory,
  ]);

  // Function to initially check auth and sync tokens with Supernova
  const syncTokensWithSupernova = useCallback(async (context: SupernovaCredentials): Promise<RemoteTokenStorageData<SupernovaStorageMetadata> | null> => {
    try {
      const storage = storageClientFactory(context);

      const content = await storage.retrieve();
      if (content) {
        if (
          !isEqual(content.tokens, tokens)
          || !isEqual(content.themes, themes)
        ) {
          const userDecision = await askUserIfPull();
          if (userDecision) {
            dispatch.tokenState.setLastSyncedState(JSON.stringify([content.tokens, content.themes], null, 2));
            dispatch.tokenState.setTokenData({
              values: content.tokens,
              themes: content.themes,
              activeTheme,
              usedTokenSet,
            });
            notifyToUI('Pulled tokens from Supernova');
          }
        }
        return content;
      }
      return await pushToSupernova(context);
    } catch (e) {
      notifyToUI('Error syncing with Supernova, check credentials', { error: true });
      console.log('Error', e);
      return null;
    }
  }, [
    askUserIfPull,
    dispatch,
    pushToSupernova,
    storageClientFactory,
    usedTokenSet,
    activeTheme,
    themes,
    tokens,
  ]);

  const addNewSupernovaCredentials = useCallback(async (context: SupernovaFormValues): Promise<RemoteTokenStorageData<SupernovaStorageMetadata> | null> => {
    const data = await syncTokensWithSupernova(context);
    if (data) {
      AsyncMessageChannel.message({
        type: AsyncMessageTypes.CREDENTIALS,
        credential: context,
      });
      if (!data.tokens) {
        notifyToUI('No tokens stored on remote');
      }
    } else {
      return null;
    }
    return {
      tokens: data.tokens ?? tokens,
      themes: data.themes ?? themes,
      metadata: {},
    };
  }, [syncTokensWithSupernova, tokens, themes]);

  return useMemo(() => ({
    addNewSupernovaCredentials,
    syncTokensWithSupernova,
    pullFromSupernova,
    pushToSupernova,
  }), [addNewSupernovaCredentials, syncTokensWithSupernova, pullFromSupernova, pushToSupernova]);
}

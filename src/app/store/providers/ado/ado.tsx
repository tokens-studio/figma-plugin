import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import { LDProps } from 'launchdarkly-react-client-sdk/lib/withLDConsumer';
import { Dispatch } from '@/app/store';
import useConfirm from '@/app/hooks/useConfirm';
import usePushDialog from '@/app/hooks/usePushDialog';
import { notifyToUI } from '../../../../plugin/notifiers';
import {
  localApiStateSelector, tokensSelector, themesListSelector, activeThemeSelector, usedTokenSetSelector,
} from '@/selectors';
import { ADOTokenStorage } from '@/storage/ADOTokenStorage';
import { isEqual } from '@/utils/isEqual';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { useFlags } from '@/app/components/LaunchDarkly';
import { RemoteResponseData } from '@/types/RemoteResponseData';
import { ErrorMessages } from '@/constants/ErrorMessages';

type AdoCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.ADO; }>;
type AdoFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.ADO; }>;

export const useADO = () => {
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const localApiState = useSelector(localApiStateSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const dispatch = useDispatch<Dispatch>();
  const { multiFileSync } = useFlags();
  const { confirm } = useConfirm();
  const { pushDialog } = usePushDialog();

  const storageClientFactory = React.useCallback((context: AdoCredentials) => {
    const storageClient = new ADOTokenStorage(context);
    if (context.filePath) storageClient.changePath(context.filePath);
    if (context.branch) storageClient.selectBranch(context.branch);
    if (multiFileSync) storageClient.enableMultiFile();
    return storageClient;
  }, [multiFileSync]);

  const askUserIfPull = React.useCallback(async () => {
    const confirmResult = await confirm({
      text: 'Pull from Ado?',
      description: 'Your repo already contains tokens, do you want to pull these now?',
    });
    return confirmResult;
  }, [confirm]);

  const pushTokensToADO = React.useCallback(async (context: AdoCredentials) => {
    const storage = storageClientFactory(context);
    if (context.branch) {
      storage.setSource(context.branch);
    }
    const content = await storage.retrieve();

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

    dispatch.uiState.setLocalApiState({ ...context });

    const pushSettings = await pushDialog();
    if (pushSettings) {
      const { commitMessage, customBranch } = pushSettings;
      try {
        if (customBranch) storage.selectBranch(customBranch);
        await storage.save({
          themes,
          tokens,
          metadata: { commitMessage },
        });
        dispatch.tokenState.setLastSyncedState(JSON.stringify([tokens, themes], null, 2));
        dispatch.uiState.setLocalApiState({ ...localApiState, branch: customBranch } as AdoCredentials);
        dispatch.uiState.setApiData({ ...context, branch: customBranch });
        dispatch.tokenState.setTokenData({
          values: tokens,
          themes,
          usedTokenSet,
          activeTheme,
        });

        pushDialog('success');

        return {
          tokens,
          themes,
          metadata: { commitMessage },
        };
      } catch (e) {
        console.log('Error pushing to ADO', e);
      }
    }

    return {
      tokens,
      themes,
      metadata: {},
    };
  }, [
    dispatch,
    storageClientFactory,
    tokens,
    themes,
    pushDialog,
    localApiState,
  ]);

  const checkAndSetAccess = React.useCallback(async (context: AdoCredentials, receivedFeatureFlags?: LDProps['flags']) => {
    const storage = storageClientFactory(context);
    if (receivedFeatureFlags?.multiFileSync) storage.enableMultiFile();
    const hasWriteAccess = await storage.canWrite();
    dispatch.tokenState.setEditProhibited(!hasWriteAccess);
  }, [dispatch, storageClientFactory]);

  const pullTokensFromADO = React.useCallback(async (context: AdoCredentials, receivedFeatureFlags?: LDProps['flags']) => {
    const storage = storageClientFactory(context);
    if (context.branch) {
      storage.setSource(context.branch);
    }
    if (receivedFeatureFlags?.multiFileSync) storage.enableMultiFile();

    await checkAndSetAccess(context, receivedFeatureFlags);

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
    checkAndSetAccess,
    storageClientFactory,
  ]);

  const syncTokensWithADO = React.useCallback(async (context: AdoCredentials): Promise<RemoteResponseData> => {
    try {
      const storage = storageClientFactory(context);
      const branches = await storage.fetchBranches();
      dispatch.branchState.setBranches(branches);
      if (branches.length === 0) {
        return {
          errorMessage: ErrorMessages.EMPTY_BRNACH_ERROR,
        };
      }

      await checkAndSetAccess(context);

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
              usedTokenSet,
              activeTheme,
            });
            dispatch.tokenState.setCollapsedTokenSets([]);
            notifyToUI('Pulled tokens from ADO');
          }
        }
        return content;
      }
      const pushData = await pushTokensToADO(context);
      return {
        ...pushData,
        ...(pushData === null ? { errorMessage: ErrorMessages.ADO_CREDNETIAL_ERROR } : {}),
      };
    } catch (e) {
      notifyToUI(ErrorMessages.ADO_CREDNETIAL_ERROR, { error: true });
      console.log('Error', e);
      return {
        errorMessage: ErrorMessages.ADO_CREDNETIAL_ERROR,
      };
    }
  }, [
    askUserIfPull,
    dispatch,
    pushTokensToADO,
    storageClientFactory,
    themes,
    tokens,
    activeTheme,
    usedTokenSet,
    checkAndSetAccess,
  ]);

  const addNewADOCredentials = React.useCallback(
    async (context: AdoFormValues): Promise<RemoteResponseData> => {
      const data = await syncTokensWithADO(context);

      if (!data.errorMessage) {
        AsyncMessageChannel.ReactInstance.message({
          type: AsyncMessageTypes.CREDENTIALS,
          credential: context,
        });
        if (!data.tokens) {
          notifyToUI('No tokens stored on remote');
        }
      } else {
        return {
          errorMessage: data.errorMessage,
        };
      }
      return {
        tokens: data.tokens ?? tokens,
        themes: data.themes ?? themes,
        metadata: {},
      };
    },
    [
      dispatch,
      tokens,
      themes,
      usedTokenSet,
      activeTheme,
      syncTokensWithADO,
    ],
  );

  const fetchADOBranches = React.useCallback(async (context: AdoCredentials) => {
    const storage = storageClientFactory(context);
    const branches = await storage.fetchBranches();
    return branches;
  }, [storageClientFactory]);

  const createADOBranch = React.useCallback((context: AdoCredentials, newBranch: string, source?: string) => {
    const storage = storageClientFactory(context);
    return storage.createBranch(newBranch, source);
  }, [storageClientFactory]);

  return React.useMemo(() => ({
    addNewADOCredentials,
    syncTokensWithADO,
    pullTokensFromADO,
    pushTokensToADO,
    fetchADOBranches,
    createADOBranch,
  }), [
    addNewADOCredentials,
    syncTokensWithADO,
    pullTokensFromADO,
    pushTokensToADO,
    fetchADOBranches,
    createADOBranch,
  ]);
};

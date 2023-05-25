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
import { applyTokenSetOrder } from '@/utils/tokenset';
import { saveLastSyncedState } from '@/utils/saveLastSyncedState';

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
  const { pushDialog, closePushDialog } = usePushDialog();

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

  const pushTokensToADO = React.useCallback(async (context: AdoCredentials): Promise<RemoteResponseData> => {
    const storage = storageClientFactory(context);
    if (context.branch) {
      storage.setSource(context.branch);
    }
    const content = await storage.retrieve();
    if (content?.status === 'failure') {
      return {
        status: 'failure',
        errorMessage: content?.errorMessage,
      };
    }
    if (
      content
      && isEqual(content.tokens, tokens)
      && isEqual(content.themes, themes)
      && isEqual(content.metadata?.tokenSetOrder ?? Object.keys(tokens), Object.keys(tokens))
    ) {
      notifyToUI('Nothing to commit');
      return {
        status: 'success',
        tokens,
        themes,
      };
    }

    dispatch.uiState.setLocalApiState({ ...context });
    dispatch.tokenState.setRemoteData({
      tokens: content?.tokens ?? {},
      themes: content?.themes ?? [],
      metadata: { tokenSetOrder: content?.metadata?.tokenSetOrder ?? [] },
    });

    const pushSettings = await pushDialog();
    if (pushSettings) {
      const { commitMessage, customBranch } = pushSettings;
      try {
        if (customBranch) storage.selectBranch(customBranch);
        const metadata = {
          tokenSetOrder: Object.keys(tokens),
        };
        await storage.save({
          themes,
          tokens,
          metadata,
        }, {
          commitMessage,
        });

        saveLastSyncedState(dispatch, tokens, themes, metadata);
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
          status: 'success',
          tokens,
          themes,
        };
      } catch (e) {
        closePushDialog();
        console.log('Error pushing to ADO', e);
        if (e instanceof Error && e.message === ErrorMessages.GIT_MULTIFILE_PERMISSION_ERROR) {
          return {
            status: 'failure',
            errorMessage: ErrorMessages.GIT_MULTIFILE_PERMISSION_ERROR,
          };
        }
        return {
          status: 'failure',
          errorMessage: ErrorMessages.ADO_CREDENTIAL_ERROR,
        };
      }
    }

    return {
      status: 'success',
      tokens,
      themes,
    };
  }, [
    dispatch,
    storageClientFactory,
    tokens,
    themes,
    pushDialog,
    closePushDialog,
    localApiState,
  ]);

  const checkAndSetAccess = React.useCallback(async (context: AdoCredentials, receivedFeatureFlags?: LDProps['flags']) => {
    const storage = storageClientFactory(context);
    if (receivedFeatureFlags?.multiFileSync) storage.enableMultiFile();
    const hasWriteAccess = await storage.canWrite();
    dispatch.tokenState.setEditProhibited(!hasWriteAccess);
  }, [dispatch, storageClientFactory]);

  const pullTokensFromADO = React.useCallback(async (context: AdoCredentials, receivedFeatureFlags?: LDProps['flags']): Promise<RemoteResponseData | null> => {
    const storage = storageClientFactory(context);
    if (context.branch) {
      storage.setSource(context.branch);
    }
    if (receivedFeatureFlags?.multiFileSync) storage.enableMultiFile();

    await checkAndSetAccess(context, receivedFeatureFlags);

    try {
      const content = await storage.retrieve();
      if (content?.status === 'failure') {
        return {
          status: 'failure',
          errorMessage: content.errorMessage,
        };
      }
      if (content) {
        // If we didn't get a tokenSetOrder from metadata, use the order of the token sets as they appeared
        const sortedTokens = applyTokenSetOrder(content.tokens, content.metadata?.tokenSetOrder ?? Object.keys(content.tokens));
        return {
          ...content,
          tokens: sortedTokens,
        };
      }
    } catch (e) {
      console.log('Error', e);
      return {
        status: 'failure',
        errorMessage: ErrorMessages.ADO_CREDENTIAL_ERROR,
      };
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
          status: 'failure',
          errorMessage: ErrorMessages.EMPTY_BRANCH_ERROR,
        };
      }

      await checkAndSetAccess(context);

      const content = await storage.retrieve();
      if (content?.status === 'failure') {
        return {
          status: 'failure',
          errorMessage: content.errorMessage,
        };
      }
      if (content) {
        if (
          !isEqual(content.tokens, tokens)
          || !isEqual(content.themes, themes)
          || !isEqual(content.metadata?.tokenSetOrder ?? Object.keys(tokens), Object.keys(tokens))
        ) {
          const userDecision = await askUserIfPull();
          if (userDecision) {
            const sortedValues = applyTokenSetOrder(content.tokens, content.metadata?.tokenSetOrder);
            saveLastSyncedState(dispatch, sortedValues, content.themes, content.metadata);
            dispatch.tokenState.setTokenData({
              values: sortedValues,
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
      return await pushTokensToADO(context);
    } catch (e) {
      notifyToUI(ErrorMessages.ADO_CREDENTIAL_ERROR, { error: true });
      console.log('Error', e);
      return {
        status: 'failure',
        errorMessage: ErrorMessages.ADO_CREDENTIAL_ERROR,
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

      if (data.status === 'success') {
        AsyncMessageChannel.ReactInstance.message({
          type: AsyncMessageTypes.CREDENTIALS,
          credential: context,
        });
        if (!data.tokens) {
          notifyToUI('No tokens stored on remote');
        }
      } else {
        return {
          status: 'failure',
          errorMessage: data.errorMessage,
        };
      }
      return {
        status: 'success',
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

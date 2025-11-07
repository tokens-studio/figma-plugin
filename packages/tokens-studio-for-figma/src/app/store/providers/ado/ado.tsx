import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect } from 'react';
import compact from 'just-compact';
import { Dispatch } from '@/app/store';
import useConfirm from '@/app/hooks/useConfirm';
import usePushDialog from '@/app/hooks/usePushDialog';
import { notifyToUI } from '../../../../plugin/notifiers';
import {
  localApiStateSelector, tokensSelector, themesListSelector, activeThemeSelector, usedTokenSetSelector, storeTokenIdInJsonEditorSelector,
} from '@/selectors';
import { ADOTokenStorage } from '@/storage/ADOTokenStorage';
import { isEqual } from '@/utils/isEqual';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { RemoteResponseData } from '@/types/RemoteResponseData';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { applyTokenSetOrder } from '@/utils/tokenset';
import { PushOverrides } from '../../remoteTokens';
import { useIsProUser } from '@/app/hooks/useIsProUser';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';
import { categorizeError } from '@/utils/error/categorizeError';

type AdoCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.ADO; }>;
type AdoFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.ADO; }>;

export const useADO = () => {
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const localApiState = useSelector(localApiStateSelector) as AdoCredentials;
  const activeTheme = useSelector(activeThemeSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const storeTokenIdInJsonEditor = useSelector(storeTokenIdInJsonEditorSelector);
  const dispatch = useDispatch<Dispatch>();
  const isProUser = useIsProUser();
  const { confirm } = useConfirm();
  const { pushDialog, closePushDialog } = usePushDialog();

  const storageClientFactory = React.useCallback((context: AdoCredentials) => {
    const storageClient = new ADOTokenStorage(context);
    if (context.filePath) storageClient.changePath(context.filePath);
    if (context.branch) storageClient.selectBranch(context.branch);
    // Always check isProUser dynamically rather than capturing it in closure
    // This ensures multi-file is enabled even if the license was validated after this callback was created
    if (isProUser) storageClient.enableMultiFile();
    return storageClient;
  }, [isProUser]);

  const askUserIfPull = React.useCallback(async () => {
    const confirmResult = await confirm({
      text: 'Pull from Ado?',
      description: 'Your repo already contains tokens, do you want to pull these now?',
    });
    return confirmResult;
  }, [confirm]);

  const pushTokensToADO = React.useCallback(async (context: AdoCredentials, overrides?: PushOverrides): Promise<RemoteResponseData> => {
    const storage = storageClientFactory(context);

    dispatch.uiState.setLocalApiState({ ...context });

    const pushSettings = await pushDialog({ state: 'initial', overrides });
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
          storeTokenIdInJsonEditor,
        });

        dispatch.uiState.setLocalApiState({ ...localApiState, branch: customBranch } as AdoCredentials);
        dispatch.uiState.setApiData({ ...context, branch: customBranch });
        dispatch.tokenState.setTokenData({
          values: tokens,
          themes,
          usedTokenSet,
          activeTheme,
          hasChangedRemote: true,
        });
        dispatch.tokenState.setRemoteData({
          tokens,
          themes,
          metadata,
        });
        const branches = await storage.fetchBranches();
        dispatch.branchState.setBranches(branches);
        const stringifiedRemoteTokens = JSON.stringify(compact([tokens, themes, TokenFormat.format]), null, 2);
        dispatch.tokenState.setLastSyncedState(stringifiedRemoteTokens);
        pushDialog({ state: 'success' });

        return {
          status: 'success',
          tokens,
          themes,
        };
      } catch (e) {
        closePushDialog();
        console.log('Error pushing to ADO', e);
        if (e instanceof Error && e.message) {
          return {
            status: 'failure',
            errorMessage: e.message,
          };
        }
        const { message } = categorizeError(e, {
          provider: StorageProviderType.ADO,
          operation: 'push',
          hasCredentials: true,
        });
        return {
          status: 'failure',
          errorMessage: message,
        };
      }
    }

    return {
      status: 'failure',
      errorMessage: 'Push to remote cancelled!',
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

  const checkAndSetAccess = React.useCallback(async (context: AdoCredentials) => {
    const storage = storageClientFactory(context);
    if (isProUser) {
      storage.enableMultiFile();
    }
    const hasWriteAccess = await storage.canWrite();
    dispatch.tokenState.setEditProhibited(!hasWriteAccess);
  }, [dispatch, storageClientFactory, isProUser]);

  // Re-check access when isProUser changes from false to true (license validation during startup)
  useEffect(() => {
    if (isProUser && localApiState && localApiState.id && localApiState.provider === 'ado') {
      checkAndSetAccess(localApiState as AdoCredentials);
    }
  }, [isProUser, localApiState, checkAndSetAccess]);

  const pullTokensFromADO = React.useCallback(async (context: AdoCredentials): Promise<RemoteResponseData | null> => {
    const storage = storageClientFactory(context);
    if (context.branch) {
      storage.setSource(context.branch);
    }

    await checkAndSetAccess(context);

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
      const { message } = categorizeError(e, {
        provider: StorageProviderType.ADO,
        operation: 'pull',
        hasCredentials: true,
      });
      return {
        status: 'failure',
        errorMessage: message,
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
            dispatch.tokenState.setTokenData({
              values: sortedValues,
              themes: content.themes,
              usedTokenSet,
              activeTheme,
              hasChangedRemote: true,
            });
            dispatch.tokenState.setRemoteData({
              tokens: sortedValues,
              themes: content.themes,
              metadata: content.metadata,
            });
            const stringifiedRemoteTokens = JSON.stringify(compact([sortedValues, content.themes, TokenFormat.format]), null, 2);
            dispatch.tokenState.setLastSyncedState(stringifiedRemoteTokens);
            dispatch.tokenState.setCollapsedTokenSets([]);
            notifyToUI('Pulled tokens from ADO');
          }
        }
        return content;
      }
      return await pushTokensToADO(context);
    } catch (e) {
      console.log('Error', e);
      const { message } = categorizeError(e, {
        provider: StorageProviderType.ADO,
        operation: 'sync',
        hasCredentials: true,
      });

      notifyToUI(message, { error: true });
      return {
        status: 'failure',
        errorMessage: message,
      };
    }
  }, [
    askUserIfPull,
    dispatch,
    pushTokensToADO,
    storageClientFactory,
    themes,
    tokens,
    checkAndSetAccess,
    activeTheme,
    usedTokenSet,
  ]);

  const addNewADOCredentials = React.useCallback(
    async (context: AdoFormValues): Promise<RemoteResponseData> => {
      const previousBranch = localApiState.branch;
      const previousFilePath = localApiState.filePath;

      if (previousBranch !== context.branch) {
        context = { ...context, previousSourceBranch: previousBranch };
      }
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
        // Go back to the previous setup if the user cancelled pushing to the remote or there was an error
        dispatch.uiState.setLocalApiState({ ...context, branch: previousBranch, filePath: previousFilePath });
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
      syncTokensWithADO,
      localApiState.branch,
      localApiState.filePath,
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

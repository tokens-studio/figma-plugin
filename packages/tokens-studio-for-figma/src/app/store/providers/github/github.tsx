import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo, useEffect } from 'react';
import compact from 'just-compact';
import { Dispatch } from '@/app/store';
import useConfirm from '@/app/hooks/useConfirm';
import usePushDialog from '@/app/hooks/usePushDialog';
import { notifyToUI } from '@/plugin/notifiers';
import {
  activeThemeSelector,
  storeTokenIdInJsonEditorSelector,
  localApiStateSelector, themesListSelector, tokensSelector, usedTokenSetSelector,
} from '@/selectors';
import { useChangedState } from '@/hooks/useChangedState';
import { GithubTokenStorage } from '@/storage/GithubTokenStorage';
import { isEqual } from '@/utils/isEqual';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { RemoteResponseData } from '@/types/RemoteResponseData';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { applyTokenSetOrder } from '@/utils/tokenset';
import { PushOverrides } from '../../remoteTokens';
import { useIsProUser } from '@/app/hooks/useIsProUser';
import { categorizeError } from '@/utils/error/categorizeError';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';

type GithubCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.GITHUB; }>;
type GithubFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.GITHUB }>;
export function useGitHub() {
  const tokens = useSelector(tokensSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const themes = useSelector(themesListSelector);
  const localApiState = useSelector(localApiStateSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const storeTokenIdInJsonEditor = useSelector(storeTokenIdInJsonEditorSelector);
  const { changedPushState } = useChangedState();
  const isProUser = useIsProUser();
  const dispatch = useDispatch<Dispatch>();
  const { confirm } = useConfirm();
  const { pushDialog, closePushDialog } = usePushDialog();

  const storageClientFactory = useCallback((context: GithubCredentials, owner?: string, repo?: string) => {
    const splitContextId = context.id.split('/');
    const storageClient = new GithubTokenStorage(context.secret, owner ?? splitContextId[0], repo ?? splitContextId[1], context.baseUrl ?? '');

    if (context.filePath) storageClient.changePath(context.filePath);
    if (context.branch) storageClient.selectBranch(context.branch);
    // Always check isProUser dynamically rather than capturing it in closure
    // This ensures multi-file is enabled even if the license was validated after this callback was created
    if (isProUser) storageClient.enableMultiFile();
    return storageClient;
  }, [isProUser]);

  const askUserIfPull = useCallback(async () => {
    const confirmResult = await confirm({
      text: 'Pull from GitHub?',
      description: 'Your repo already contains tokens, do you want to pull these now?',
    });
    return confirmResult;
  }, [confirm]);

  const pushTokensToGitHub = useCallback(async (context: GithubCredentials, overrides?: PushOverrides): Promise<RemoteResponseData> => {
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

        // Check if we should use optimized multi-file sync
        const isMultiFileMode = isProUser && context.filePath && !context.filePath.endsWith('.json');
        const hasChanges = Object.keys(changedPushState.tokens).length > 0 || changedPushState.themes.length > 0 || changedPushState.metadata;

        if (isMultiFileMode && hasChanges) {
          // Use the optimized save method for multi-file mode
          await (storage as GithubTokenStorage).saveOptimized({
            themes,
            tokens,
            metadata,
          }, {
            commitMessage,
            storeTokenIdInJsonEditor,
          }, {
            tokens: changedPushState.tokens,
            themes: changedPushState.themes,
            metadata: changedPushState.metadata || null,
          });
        } else {
          await storage.save({
            themes,
            tokens,
            metadata,
          }, {
            commitMessage,
            storeTokenIdInJsonEditor,
          });
        }
        const commitSha = await storage.getCommitSha();
        dispatch.uiState.setLocalApiState({ ...localApiState, branch: customBranch } as GithubCredentials);
        dispatch.uiState.setApiData({ ...context, branch: customBranch, ...(commitSha ? { commitSha } : {}) });
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
        // eslint-disable-next-line no-console
        console.log('Error pushing to GitHub', e);
        if (e instanceof Error && e.message === ErrorMessages.GIT_MULTIFILE_PERMISSION_ERROR) {
          return {
            status: 'failure',
            errorMessage: ErrorMessages.GIT_MULTIFILE_PERMISSION_ERROR,
          };
        }
        const { message } = categorizeError(e, {
          provider: StorageProviderType.GITHUB,
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
      status: 'success',
      tokens,
      themes,
      metadata: {},
    };
  }, [
    storageClientFactory,
    dispatch.uiState,
    dispatch.tokenState,
    pushDialog,
    closePushDialog,
    tokens,
    themes,
    localApiState,
    usedTokenSet,
    activeTheme,
    changedPushState,
    isProUser,
    storeTokenIdInJsonEditor,
  ]);

  const checkAndSetAccess = useCallback(async ({
    context, owner, repo,
  }: { context: GithubCredentials; owner: string; repo: string }) => {
    const storage = storageClientFactory(context, owner, repo);

    // Enable multi-file if user is pro, even if storage was created before license validation
    if (isProUser) {
      storage.enableMultiFile();
    }

    const hasWriteAccess = await storage.canWrite();
    dispatch.tokenState.setEditProhibited(!hasWriteAccess);
  }, [dispatch, storageClientFactory, isProUser]);

  // Re-check access when isProUser changes from false to true (license validation during startup)
  useEffect(() => {
    if (isProUser && localApiState && 'id' in localApiState && localApiState.id && localApiState.provider === 'github') {
      const [owner, repo] = localApiState.id.split('/');
      checkAndSetAccess({
        context: localApiState as GithubCredentials,
        owner,
        repo,
      });
    }
  }, [isProUser, localApiState, checkAndSetAccess]);

  const pullTokensFromGitHub = useCallback(async (context: GithubCredentials): Promise<RemoteResponseData | null> => {
    const storage = storageClientFactory(context);

    const [owner, repo] = context.id.split('/');

    await checkAndSetAccess({
      context, owner, repo,
    });

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
        const commitSha = await storage.getCommitSha();
        return {
          ...content,
          tokens: sortedTokens,
          commitSha,
        };
      }
    } catch (e) {
      const { message } = categorizeError(e, {
        provider: StorageProviderType.GITHUB,
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

  // Function to initially check auth and sync tokens with GitHub
  const syncTokensWithGitHub = useCallback(async (context: GithubCredentials): Promise<RemoteResponseData> => {
    try {
      const storage = storageClientFactory(context);
      const hasBranches = await storage.fetchBranches();
      dispatch.branchState.setBranches(hasBranches);
      if (!hasBranches || !hasBranches.length) {
        return {
          status: 'failure',
          errorMessage: ErrorMessages.EMPTY_BRANCH_ERROR,
        };
      }

      const [owner, repo] = context.id.split('/');
      await checkAndSetAccess({ context, owner, repo });

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
            const commitSha = await storage.getCommitSha();
            const sortedValues = applyTokenSetOrder(content.tokens, content.metadata?.tokenSetOrder);
            dispatch.tokenState.setTokenData({
              values: sortedValues,
              themes: content.themes,
              activeTheme,
              usedTokenSet,
              hasChangedRemote: true,
            });
            dispatch.tokenState.setRemoteData({
              tokens: sortedValues,
              themes: content.themes,
              metadata: content.metadata,
            });
            const stringifiedRemoteTokens = JSON.stringify(compact([content.tokens, content.themes, TokenFormat.format]), null, 2);
            dispatch.tokenState.setLastSyncedState(stringifiedRemoteTokens);
            dispatch.tokenState.setCollapsedTokenSets([]);
            dispatch.uiState.setApiData({ ...context, ...(commitSha ? { commitSha } : {}) });
            notifyToUI('Pulled tokens from GitHub');
          }
        }
        return content;
      }
      return await pushTokensToGitHub(context);
    } catch (e) {
      const { type, message } = categorizeError(e, {
        provider: StorageProviderType.GITHUB,
        operation: 'sync',
        hasCredentials: true,
      });
      console.log('Error', e);

      if (type === 'parsing') {
        notifyToUI('Failed to parse token file - check JSON format', { error: true });
        return {
          status: 'failure',
          errorMessage: message,
        };
      }
      notifyToUI(message, { error: true });
      return {
        status: 'failure',
        errorMessage: message,
      };
    }
  }, [
    askUserIfPull,
    dispatch,
    pushTokensToGitHub,
    storageClientFactory,
    usedTokenSet,
    activeTheme,
    themes,
    tokens,
    checkAndSetAccess,
  ]);

  const addNewGitHubCredentials = useCallback(async (context: GithubFormValues): Promise<RemoteResponseData> => {
    const data = await syncTokensWithGitHub(context);
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
  }, [
    syncTokensWithGitHub,
    tokens,
    themes,
  ]);

  const fetchGithubBranches = useCallback(async (context: GithubCredentials) => {
    const storage = storageClientFactory(context);
    return storage.fetchBranches();
  }, [storageClientFactory]);

  const createGithubBranch = useCallback((context: GithubCredentials, newBranch: string, source?: string) => {
    const storage = storageClientFactory(context);
    return storage.createBranch(newBranch, source);
  }, [storageClientFactory]);

  const checkRemoteChangeForGitHub = useCallback(async (context: GithubCredentials): Promise<boolean> => {
    const storage = storageClientFactory(context);
    try {
      const remoteSha = await storage.getCommitSha();
      if (remoteSha && context.commitSha && context.commitSha !== remoteSha) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [storageClientFactory]);

  return useMemo(() => ({
    addNewGitHubCredentials,
    syncTokensWithGitHub,
    pullTokensFromGitHub,
    pushTokensToGitHub,
    fetchGithubBranches,
    createGithubBranch,
    checkRemoteChangeForGitHub,
  }), [
    addNewGitHubCredentials,
    syncTokensWithGitHub,
    pullTokensFromGitHub,
    pushTokensToGitHub,
    fetchGithubBranches,
    createGithubBranch,
    checkRemoteChangeForGitHub,
  ]);
}

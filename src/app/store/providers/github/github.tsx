import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { LDProps } from 'launchdarkly-react-client-sdk/lib/withLDConsumer';
import { Dispatch } from '@/app/store';
import useConfirm from '@/app/hooks/useConfirm';
import usePushDialog from '@/app/hooks/usePushDialog';
import { notifyToUI } from '@/plugin/notifiers';
import {
  activeThemeSelector,
  localApiStateSelector, themesListSelector, tokensSelector, usedTokenSetSelector,
} from '@/selectors';
import { GithubTokenStorage } from '@/storage/GithubTokenStorage';
import { isEqual } from '@/utils/isEqual';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { useFlags } from '@/app/components/LaunchDarkly';
import { RemoteResponseData } from '@/types/RemoteResponseData';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { applyTokenSetOrder } from '@/utils/tokenset';
import { saveLastSyncedState } from '@/utils/saveLastSyncedState';

type GithubCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.GITHUB; }>;
type GithubFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.GITHUB }>;
export function useGitHub() {
  const tokens = useSelector(tokensSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const themes = useSelector(themesListSelector);
  const localApiState = useSelector(localApiStateSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const { multiFileSync } = useFlags();
  const dispatch = useDispatch<Dispatch>();
  const { confirm } = useConfirm();
  const { pushDialog, closePushDialog } = usePushDialog();

  const storageClientFactory = useCallback((context: GithubCredentials, owner?: string, repo?: string) => {
    const splitContextId = context.id.split('/');
    const storageClient = new GithubTokenStorage(context.secret, owner ?? splitContextId[0], repo ?? splitContextId[1], context.baseUrl ?? '');

    if (context.filePath) storageClient.changePath(context.filePath);
    if (context.branch) storageClient.selectBranch(context.branch);
    if (multiFileSync) storageClient.enableMultiFile();
    return storageClient;
  }, [multiFileSync]);

  const askUserIfPull = useCallback(async () => {
    const confirmResult = await confirm({
      text: 'Pull from GitHub?',
      description: 'Your repo already contains tokens, do you want to pull these now?',
    });
    return confirmResult;
  }, [confirm]);

  const pushTokensToGitHub = useCallback(async (context: GithubCredentials): Promise<RemoteResponseData> => {
    const storage = storageClientFactory(context);
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
        themes,
        tokens,
        metadata: {
          tokenSetOrder: Object.keys(tokens),
        },
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
        const commitSha = await storage.getCommitSha();
        saveLastSyncedState(dispatch, tokens, themes, metadata);
        dispatch.uiState.setLocalApiState({ ...localApiState, branch: customBranch } as GithubCredentials);
        dispatch.uiState.setApiData({ ...context, branch: customBranch, ...(commitSha ? { commitSha } : {}) });
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
        console.log('Error pushing to GitHub', e);
        if (e instanceof Error && e.message === ErrorMessages.GIT_MULTIFILE_PERMISSION_ERROR) {
          return {
            status: 'failure',
            errorMessage: ErrorMessages.GIT_MULTIFILE_PERMISSION_ERROR,
          };
        }
        return {
          status: 'failure',
          errorMessage: ErrorMessages.GITHUB_CREDENTIAL_ERROR,
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
  ]);

  const checkAndSetAccess = useCallback(async ({
    context, owner, repo, receivedFeatureFlags,
  }: { context: GithubCredentials; owner: string; repo: string, receivedFeatureFlags?: LDProps['flags'] }) => {
    const storage = storageClientFactory(context, owner, repo);
    if (receivedFeatureFlags?.multiFileSync) storage.enableMultiFile();
    const hasWriteAccess = await storage.canWrite();
    dispatch.tokenState.setEditProhibited(!hasWriteAccess);
  }, [dispatch, storageClientFactory]);

  const pullTokensFromGitHub = useCallback(async (context: GithubCredentials, receivedFeatureFlags?: LDProps['flags']): Promise<RemoteResponseData | null> => {
    const storage = storageClientFactory(context);
    if (receivedFeatureFlags?.multiFileSync) storage.enableMultiFile();

    const [owner, repo] = context.id.split('/');

    await checkAndSetAccess({
      context, owner, repo, receivedFeatureFlags,
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
      return {
        status: 'failure',
        errorMessage: ErrorMessages.GITHUB_CREDENTIAL_ERROR,
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
            saveLastSyncedState(dispatch, sortedValues, content.themes, content.metadata);
            dispatch.tokenState.setTokenData({
              values: sortedValues,
              themes: content.themes,
              activeTheme,
              usedTokenSet,
            });
            dispatch.tokenState.setCollapsedTokenSets([]);
            dispatch.uiState.setApiData({ ...context, ...(commitSha ? { commitSha } : {}) });
            notifyToUI('Pulled tokens from GitHub');
          }
        }
        return content;
      }
      return await pushTokensToGitHub(context);
    } catch (e) {
      notifyToUI(ErrorMessages.GITHUB_CREDENTIAL_ERROR, { error: true });
      console.log('Error', e);
      return {
        status: 'failure',
        errorMessage: ErrorMessages.GITHUB_CREDENTIAL_ERROR,
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

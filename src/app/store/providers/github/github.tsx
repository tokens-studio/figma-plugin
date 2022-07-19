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

type GithubCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.GITHUB | StorageProviderType.GITLAB; }>;
type GithubFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.GITHUB | StorageProviderType.GITLAB }>;
export function useGitHub() {
  const tokens = useSelector(tokensSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const themes = useSelector(themesListSelector);
  const localApiState = useSelector(localApiStateSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const { multiFileSync } = useFlags();
  const dispatch = useDispatch<Dispatch>();
  const { confirm } = useConfirm();
  const { pushDialog } = usePushDialog();

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

    if (content) {
      if (
        content
        && isEqual(content.tokens, tokens)
        && isEqual(content.themes, themes)
      ) {
        notifyToUI('Nothing to commit');
        const returnValue = {
          hasError: false,
          data: {
            tokens,
            themes,
            metadata: {},
          },
        };
        return returnValue;
      }
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
        dispatch.uiState.setLocalApiState({ ...localApiState, branch: customBranch } as GithubCredentials);
        dispatch.uiState.setApiData({ ...context, branch: customBranch });
        dispatch.tokenState.setTokenData({
          values: tokens,
          themes,
          usedTokenSet,
          activeTheme,
        });
        pushDialog('success');
        const returnValue = {
          hasError: false,
          data: {
            tokens,
            themes,
            metadata: { commitMessage },
          },
        };
        return returnValue;
      } catch (e) {
        console.log('Error pushing to GitHub', e);
      }
    }

    const returnValue = {
      hasError: false,
      data: {
        tokens,
        themes,
        metadata: {},
      },
    };
    return returnValue;
  }, [
    storageClientFactory,
    dispatch.uiState,
    dispatch.tokenState,
    pushDialog,
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

  const pullTokensFromGitHub = useCallback(async (context: GithubCredentials, receivedFeatureFlags?: LDProps['flags']) => {
    const storage = storageClientFactory(context);
    if (receivedFeatureFlags?.multiFileSync) storage.enableMultiFile();

    const [owner, repo] = context.id.split('/');

    await checkAndSetAccess({
      context, owner, repo, receivedFeatureFlags,
    });

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

  // Function to initially check auth and sync tokens with GitHub
  const syncTokensWithGitHub = useCallback(async (context: GithubCredentials): Promise<RemoteResponseData> => {
    try {
      const storage = storageClientFactory(context);
      const hasBranches = await storage.fetchBranches();
      dispatch.branchState.setBranches(hasBranches);
      if (!hasBranches || !hasBranches.length) {
        const response = {
          hasError: true,
          data: {
            errorMessage: 'There is no branch',
          },
        };
        return response;
      }

      const [owner, repo] = context.id.split('/');
      await checkAndSetAccess({ context, owner, repo });

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
            dispatch.tokenState.setCollapsedTokenSets([]);
            notifyToUI('Pulled tokens from GitHub');
          }
        }
        const response = {
          hasError: false,
          data: content,
        };
        return response;
      }
      return await pushTokensToGitHub(context);
    } catch (e) {
      notifyToUI('Error syncing with GitHub, check credentials', { error: true });
      console.log('Error', e);
      const response = {
        hasError: true,
        data: {
          errorMessage: 'Error syncing with GitHub, check credentials',
        },
      };
      return response;
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
    const { data, hasError } = await syncTokensWithGitHub(context);
    if (!hasError) {
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.CREDENTIALS,
        credential: context,
      });
      if (!data.tokens) {
        notifyToUI('No tokens stored on remote');
      }
    } else {
      const response = {
        hasError: true,
        data: {
          errorMessage: 'Error syncing with GitHub, check credentials',
        },
      };
      return response;
    }
    const response = {
      hasError: false,
      data: {
        tokens: data.tokens ?? tokens,
        themes: data.themes ?? themes,
        metadata: {},
      },
    };
    return response;
  }, [
    syncTokensWithGitHub,
    tokens,
    themes,
    dispatch.tokenState,
    usedTokenSet,
    activeTheme,
  ]);

  const fetchGithubBranches = useCallback(async (context: GithubCredentials) => {
    const storage = storageClientFactory(context);
    return storage.fetchBranches();
  }, [storageClientFactory]);

  const createGithubBranch = useCallback((context: GithubCredentials, newBranch: string, source?: string) => {
    const storage = storageClientFactory(context);
    return storage.createBranch(newBranch, source);
  }, [storageClientFactory]);

  return useMemo(() => ({
    addNewGitHubCredentials,
    syncTokensWithGitHub,
    pullTokensFromGitHub,
    pushTokensToGitHub,
    fetchGithubBranches,
    createGithubBranch,
  }), [
    addNewGitHubCredentials,
    syncTokensWithGitHub,
    pullTokensFromGitHub,
    pushTokensToGitHub,
    fetchGithubBranches,
    createGithubBranch,
  ]);
}

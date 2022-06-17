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
import { RemoteTokenStorageData } from '@/storage/RemoteTokenStorage';
import { GitStorageMetadata } from '@/storage/GitTokenStorage';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { useFlags } from '@/app/components/LaunchDarkly';

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
    if (confirmResult === false) return false;
    return confirmResult.result;
  }, [confirm]);

  const pushTokensToGitHub = useCallback(async (context: GithubCredentials): Promise<RemoteTokenStorageData<GitStorageMetadata> | null> => {
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
        return {
          tokens,
          themes,
          metadata: { commitMessage },
        };
      } catch (e) {
        console.log('Error pushing to GitHub', e);
      }
    }

    return {
      tokens,
      themes,
      metadata: {},
    };
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

  const checkAndSetAccess = useCallback(async ({ context, owner, repo }: { context: GithubCredentials; owner: string; repo: string }) => {
    const storage = storageClientFactory(context, owner, repo);
    const hasWriteAccess = await storage.canWrite();
    dispatch.tokenState.setEditProhibited(!hasWriteAccess);
  }, [dispatch, storageClientFactory]);

  const pullTokensFromGitHub = useCallback(async (context: GithubCredentials, receivedFeatureFlags?: LDProps['flags']) => {
    const storage = storageClientFactory(context);
    if (receivedFeatureFlags?.multiFileSync) storage.enableMultiFile();

    const [owner, repo] = context.id.split('/');

    await checkAndSetAccess({ context, owner, repo });

    try {
      const content = await storage.retrieve();
      console.log('pullGithu', content);
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
  const syncTokensWithGitHub = useCallback(async (context: GithubCredentials): Promise<RemoteTokenStorageData<GitStorageMetadata> | null> => {
    try {
      const storage = storageClientFactory(context);
      const hasBranches = await storage.fetchBranches();
      dispatch.branchState.setBranches(hasBranches);
      if (!hasBranches || !hasBranches.length) {
        return null;
      }

      const [owner, repo] = context.id.split('/');
      await checkAndSetAccess({ context, owner, repo });

      const content = await storage.retrieve();
      console.log('syncGithu', content);
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
            notifyToUI('Pulled tokens from GitHub');
          }
        }
        return content;
      }
      return await pushTokensToGitHub(context);
    } catch (e) {
      notifyToUI('Error syncing with GitHub, check credentials', { error: true });
      console.log('Error', e);
      return null;
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

  const addNewGitHubCredentials = useCallback(async (context: GithubFormValues): Promise<RemoteTokenStorageData<GitStorageMetadata> | null> => {
    const data = await syncTokensWithGitHub(context);
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

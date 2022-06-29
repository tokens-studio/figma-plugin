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
import { GitlabTokenStorage } from '@/storage/GitlabTokenStorage';
import { isEqual } from '@/utils/isEqual';
import { RemoteTokenStorageData } from '@/storage/RemoteTokenStorage';
import { GitStorageMetadata } from '@/storage/GitTokenStorage';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { useFlags } from '@/app/components/LaunchDarkly';
import { getRepositoryInformation } from '../getRepositoryInformation';
import { applyTokenSetOrder } from '@/utils/tokenset';
import { saveLastSyncedState } from '@/utils/saveLastSyncedState';

type GitlabCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.GITHUB | StorageProviderType.GITLAB; }>;
type GitlabFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.GITHUB | StorageProviderType.GITLAB }>;

export function useGitLab() {
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const localApiState = useSelector(localApiStateSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const { multiFileSync } = useFlags();
  const dispatch = useDispatch<Dispatch>();

  const { confirm } = useConfirm();
  const { pushDialog } = usePushDialog();

  const storageClientFactory = useCallback(async (context: GitlabCredentials, owner?: string, repo?: string) => {
    const { ownerId, repositoryId } = getRepositoryInformation(context.id);
    const storageClient = new GitlabTokenStorage(context.secret, owner ?? ownerId, repo ?? repositoryId, context.baseUrl ?? '');
    if (context.filePath) storageClient.changePath(context.filePath);
    if (context.branch) storageClient.selectBranch(context.branch);
    if (multiFileSync) storageClient.enableMultiFile();
    return storageClient.assignProjectId();
  }, [multiFileSync]);

  const askUserIfPull = useCallback(async () => {
    const confirmResult = await confirm({
      text: 'Pull from GitLab?',
      description: 'Your repo already contains tokens, do you want to pull these now?',
    });
    return confirmResult;
  }, [confirm]);

  const pushTokensToGitLab = useCallback(async (context: GitlabCredentials) => {
    const storage = await storageClientFactory(context);

    const content = await storage.retrieve();

    if (content) {
      if (
        content
        && isEqual(content.tokens, tokens)
        && isEqual(content.themes, themes)
        && isEqual(content.metadata?.tokenSetOrder ?? Object.keys(tokens), Object.keys(tokens))
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
        dispatch.uiState.setLocalApiState({ ...localApiState, branch: customBranch } as GitlabCredentials);
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
          metadata: {},
        };
      } catch (e) {
        console.log('Error pushing to GitLab', e);
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
    pushDialog,
    tokens,
    themes,
    localApiState,
    usedTokenSet,
    activeTheme,
  ]);

  const checkAndSetAccess = useCallback(async ({ context, owner, repo }: { context: GitlabCredentials; owner: string; repo: string }) => {
    const storage = await storageClientFactory(context, owner, repo);
    const hasWriteAccess = await storage.canWrite();
    dispatch.tokenState.setEditProhibited(!hasWriteAccess);
  }, [dispatch, storageClientFactory]);

  const pullTokensFromGitLab = useCallback(async (context: GitlabCredentials, receivedFeatureFlags?: LDProps['flags']) => {
    const storage = await storageClientFactory(context);
    if (receivedFeatureFlags?.multiFileSync) storage.enableMultiFile();
    const { ownerId: owner, repositoryId: repo } = getRepositoryInformation(context.id);

    await checkAndSetAccess({ context, owner, repo });

    try {
      const content = await storage.retrieve();

      if (content) {
        const sortedTokens = applyTokenSetOrder(content.tokens, content.metadata?.tokenSetOrder ?? []);
        return {
          ...content,
          tokens: sortedTokens,
        };
      }
    } catch (e) {
      console.log('Error', e);
    }
    return null;
  }, [storageClientFactory, checkAndSetAccess]);

  const syncTokensWithGitLab = useCallback(async (context: GitlabCredentials): Promise<RemoteTokenStorageData<GitStorageMetadata> | null> => {
    try {
      const storage = await storageClientFactory(context);
      const hasBranches = await storage.fetchBranches();
      dispatch.branchState.setBranches(hasBranches);

      if (!hasBranches || !hasBranches.length) {
        return null;
      }

      const { ownerId: owner, repositoryId: repo } = getRepositoryInformation(context.id);
      await checkAndSetAccess({ context, owner, repo });

      const content = await storage.retrieve();
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
            notifyToUI('Pulled tokens from GitLab');
          }
        }
        return content;
      }
      return await pushTokensToGitLab(context);
    } catch (err) {
      notifyToUI('Error syncing with GitLab, check credentials', { error: true });
      console.log('Error', err);
      return null;
    }
  }, [
    storageClientFactory,
    dispatch.branchState,
    dispatch.tokenState,
    pushTokensToGitLab,
    tokens,
    themes,
    askUserIfPull,
    usedTokenSet,
    activeTheme,
    checkAndSetAccess,
  ]);

  const addNewGitLabCredentials = useCallback(async (context: GitlabFormValues): Promise<RemoteTokenStorageData<GitStorageMetadata> | null> => {
    const data = await syncTokensWithGitLab(context);
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
    syncTokensWithGitLab,
    tokens,
    themes,
    dispatch.tokenState,
    usedTokenSet,
    activeTheme,
  ]);

  const fetchGitLabBranches = useCallback(async (context: GitlabCredentials) => {
    const storage = await storageClientFactory(context);
    return storage.fetchBranches();
  }, [storageClientFactory]);

  const createGitLabBranch = useCallback(async (context: GitlabCredentials, newBranch: string, source?: string) => {
    const storage = await storageClientFactory(context);
    return storage.createBranch(newBranch, source);
  }, [storageClientFactory]);

  return useMemo(() => ({
    addNewGitLabCredentials,
    syncTokensWithGitLab,
    pullTokensFromGitLab,
    pushTokensToGitLab,
    fetchGitLabBranches,
    createGitLabBranch,
  }), [
    addNewGitLabCredentials,
    syncTokensWithGitLab,
    pullTokensFromGitLab,
    pushTokensToGitLab,
    fetchGitLabBranches,
    createGitLabBranch,
  ]);
}

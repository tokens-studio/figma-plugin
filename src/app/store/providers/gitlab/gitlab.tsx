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
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { useFlags } from '@/app/components/LaunchDarkly';
import { getRepositoryInformation } from '../getRepositoryInformation';
import { RemoteResponseData } from '@/types/RemoteResponseData';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { applyTokenSetOrder } from '@/utils/tokenset';
import { saveLastSyncedState } from '@/utils/saveLastSyncedState';

export type GitlabCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.GITLAB; }>;
type GitlabFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.GITLAB }>;

export const clientFactory = async (context: GitlabCredentials, multiFileSync: boolean) => {
  const {
    secret, baseUrl, id: repoPathWithNamespace, filePath, branch,
  } = context;
  const { repositoryId } = getRepositoryInformation(repoPathWithNamespace);

  const storageClient = new GitlabTokenStorage(secret, repositoryId, repoPathWithNamespace, baseUrl ?? '');
  if (filePath) storageClient.changePath(filePath);
  if (branch) storageClient.selectBranch(branch);
  if (multiFileSync) storageClient.enableMultiFile();
  return storageClient.assignProjectId();
};

export function useGitLab() {
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const localApiState = useSelector(localApiStateSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const { multiFileSync } = useFlags();
  const dispatch = useDispatch<Dispatch>();

  const { confirm } = useConfirm();
  const { pushDialog, closePushDialog } = usePushDialog();

  const storageClientFactory = useCallback(clientFactory, []);

  const askUserIfPull = useCallback(async () => {
    const confirmResult = await confirm({
      text: 'Pull from GitLab?',
      description: 'Your repo already contains tokens, do you want to pull these now?',
    });
    return confirmResult;
  }, [confirm]);

  const pushTokensToGitLab = useCallback(async (context: GitlabCredentials): Promise<RemoteResponseData> => {
    const storage = await storageClientFactory(context, multiFileSync);

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
        metadata: {},
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
        const latestCommitDate = await storage.getLatestCommitDate();
        saveLastSyncedState(dispatch, tokens, themes, metadata);
        dispatch.uiState.setLocalApiState({ ...localApiState, branch: customBranch } as GitlabCredentials);
        dispatch.uiState.setApiData({ ...context, branch: customBranch, ...(latestCommitDate ? { commitDate: latestCommitDate } : {}) });
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
          metadata: {},
        };
      } catch (e) {
        closePushDialog();
        console.log('Error pushing to GitLab', e);
        if (e instanceof Error && e.message === ErrorMessages.GIT_MULTIFILE_PERMISSION_ERROR) {
          return {
            status: 'failure',
            errorMessage: ErrorMessages.GIT_MULTIFILE_PERMISSION_ERROR,
          };
        }
        return {
          status: 'failure',
          errorMessage: ErrorMessages.GITLAB_CREDENTIAL_ERROR,
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
    dispatch,
    storageClientFactory,
    pushDialog,
    closePushDialog,
    tokens,
    themes,
    localApiState,
    usedTokenSet,
    activeTheme,
    multiFileSync,
  ]);

  const checkAndSetAccess = useCallback(async ({
    context, receivedFeatureFlags,
  }: { context: GitlabCredentials; receivedFeatureFlags?: LDProps['flags'] }) => {
    const storage = await storageClientFactory(context, multiFileSync);
    if (receivedFeatureFlags?.multiFileSync) storage.enableMultiFile();
    const hasWriteAccess = await storage.canWrite();
    dispatch.tokenState.setEditProhibited(!hasWriteAccess);
  }, [dispatch, storageClientFactory, multiFileSync]);

  const pullTokensFromGitLab = useCallback(async (context: GitlabCredentials, receivedFeatureFlags?: LDProps['flags']): Promise<RemoteResponseData | null> => {
    const storage = await storageClientFactory(context, multiFileSync);
    if (receivedFeatureFlags?.multiFileSync) storage.enableMultiFile();
    await checkAndSetAccess({
      context, receivedFeatureFlags,
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
        const latestCommitDate = await storage.getLatestCommitDate();
        return {
          ...content,
          tokens: sortedTokens,
          ...(latestCommitDate ? { commitDate: latestCommitDate } : {}),
        };
      }
    } catch (e) {
      console.log('Error', e);
      return {
        status: 'failure',
        errorMessage: ErrorMessages.GITLAB_CREDENTIAL_ERROR,
      };
    }
    return null;
  }, [storageClientFactory, checkAndSetAccess, multiFileSync]);

  const syncTokensWithGitLab = useCallback(async (context: GitlabCredentials): Promise<RemoteResponseData> => {
    try {
      const storage = await storageClientFactory(context, multiFileSync);
      const hasBranches = await storage.fetchBranches();
      dispatch.branchState.setBranches(hasBranches);

      if (!hasBranches || !hasBranches.length) {
        return {
          status: 'failure',
          errorMessage: ErrorMessages.EMPTY_BRANCH_ERROR,
        };
      }

      await checkAndSetAccess({ context });

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
            const latestCommitDate = await storage.getLatestCommitDate();
            const sortedValues = applyTokenSetOrder(content.tokens, content.metadata?.tokenSetOrder);
            saveLastSyncedState(dispatch, sortedValues, content.themes, content.metadata);
            dispatch.tokenState.setTokenData({
              values: sortedValues,
              themes: content.themes,
              usedTokenSet,
              activeTheme,
            });
            dispatch.tokenState.setCollapsedTokenSets([]);
            dispatch.uiState.setApiData({ ...context, ...(latestCommitDate ? { commitDate: latestCommitDate } : {}) });
            notifyToUI('Pulled tokens from GitLab');
          }
        }
        return content;
      }
      return await pushTokensToGitLab(context);
    } catch (err) {
      notifyToUI(ErrorMessages.GITLAB_CREDENTIAL_ERROR, { error: true });
      console.log('Error', err);
      return {
        status: 'failure',
        errorMessage: ErrorMessages.GITLAB_CREDENTIAL_ERROR,
      };
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
    multiFileSync,
  ]);

  const addNewGitLabCredentials = useCallback(async (context: GitlabFormValues): Promise<RemoteResponseData> => {
    const data = await syncTokensWithGitLab(context);
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
    syncTokensWithGitLab,
    tokens,
    themes,
  ]);

  const fetchGitLabBranches = useCallback(async (context: GitlabCredentials) => {
    const storage = await storageClientFactory(context, multiFileSync);
    return storage.fetchBranches();
  }, [storageClientFactory, multiFileSync]);

  const createGitLabBranch = useCallback(async (context: GitlabCredentials, newBranch: string, source?: string) => {
    const storage = await storageClientFactory(context, multiFileSync);
    return storage.createBranch(newBranch, source);
  }, [storageClientFactory, multiFileSync]);

  const checkRemoteChangeForGitLab = useCallback(async (context: GitlabCredentials): Promise<boolean> => {
    const storage = await storageClientFactory(context, multiFileSync);
    try {
      const latestCommitDate = await storage.getLatestCommitDate();
      if (!!latestCommitDate && !!context.commitDate && new Date(latestCommitDate) > new Date(context.commitDate)) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [storageClientFactory, multiFileSync]);

  return useMemo(() => ({
    addNewGitLabCredentials,
    syncTokensWithGitLab,
    pullTokensFromGitLab,
    pushTokensToGitLab,
    fetchGitLabBranches,
    createGitLabBranch,
    checkRemoteChangeForGitLab,
  }), [
    addNewGitLabCredentials,
    syncTokensWithGitLab,
    pullTokensFromGitLab,
    pushTokensToGitLab,
    fetchGitLabBranches,
    createGitLabBranch,
    checkRemoteChangeForGitLab,
  ]);
}

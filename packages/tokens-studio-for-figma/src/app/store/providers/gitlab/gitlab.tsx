import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { LDProps } from 'launchdarkly-react-client-sdk/lib/withLDConsumer';
import compact from 'just-compact';
import type { StorageProviderType } from '@sync-providers/types';
import { Dispatch } from '@/app/store';
import useConfirm from '@/app/hooks/useConfirm';
import usePushDialog from '@/app/hooks/usePushDialog';
import { notifyToUI } from '@/plugin/notifiers';
import {
  activeThemeSelector,
  storeTokenIdInJsonEditorSelector,
  localApiStateSelector, themesListSelector, tokensSelector, usedTokenSetSelector,
} from '@/selectors';
import { GitlabTokenStorage } from '@/storage/GitlabTokenStorage';
import { isEqual } from '@/utils/isEqual';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import { getRepositoryInformation } from '../getRepositoryInformation';
import { RemoteResponseData } from '@/types/RemoteResponseData';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { applyTokenSetOrder } from '@/utils/tokenset';
import { PushOverrides } from '../../remoteTokens';
import { useIsProUser } from '@/app/hooks/useIsProUser';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';

export type GitlabCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.GITLAB; }>;
type GitlabFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.GITLAB }>;

export const clientFactory = async (context: GitlabCredentials, isProUser: boolean) => {
  const {
    secret, baseUrl, id: repoPathWithNamespace, filePath, branch,
  } = context;
  const { repositoryId } = getRepositoryInformation(repoPathWithNamespace);

  const storageClient = new GitlabTokenStorage(secret, repositoryId, repoPathWithNamespace, baseUrl ?? '');
  if (filePath) storageClient.changePath(filePath);
  if (branch) storageClient.selectBranch(branch);
  if (isProUser) storageClient.enableMultiFile();
  return storageClient.assignProjectId();
};

export function useGitLab() {
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const localApiState = useSelector(localApiStateSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const storeTokenIdInJsonEditor = useSelector(storeTokenIdInJsonEditorSelector);
  const isProUser = useIsProUser();
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

  const pushTokensToGitLab = useCallback(async (context: GitlabCredentials, overrides?: PushOverrides): Promise<RemoteResponseData> => {
    const storage = await storageClientFactory(context, isProUser);

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
        const latestCommitDate = await storage.getLatestCommitDate();
        dispatch.uiState.setLocalApiState({ ...localApiState, branch: customBranch } as GitlabCredentials);
        dispatch.uiState.setApiData({ ...context, branch: customBranch, ...(latestCommitDate ? { commitDate: latestCommitDate } : {}) });
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
          metadata: {},
        };
      } catch (e: any) {
        closePushDialog();
        console.log('Error pushing to GitLab', e);
        if (e instanceof Error && e.message === ErrorMessages.GIT_MULTIFILE_PERMISSION_ERROR) {
          return {
            status: 'failure',
            errorMessage: ErrorMessages.GIT_MULTIFILE_PERMISSION_ERROR,
          };
        }
        if (e instanceof Error && e.message === ErrorMessages.GITLAB_PUSH_TO_PROTECTED_BRANCH_ERROR) {
          return {
            status: 'failure',
            errorMessage: ErrorMessages.GITLAB_PUSH_TO_PROTECTED_BRANCH_ERROR,
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
    isProUser,
    storeTokenIdInJsonEditor,
  ]);

  const checkAndSetAccess = useCallback(async ({
    context, receivedFeatureFlags,
  }: { context: GitlabCredentials; receivedFeatureFlags?: LDProps['flags'] }) => {
    const storage = await storageClientFactory(context, isProUser);
    if (receivedFeatureFlags?.multiFileSync) storage.enableMultiFile();
    const hasWriteAccess = await storage.canWrite();
    dispatch.tokenState.setEditProhibited(!hasWriteAccess);
  }, [dispatch, storageClientFactory, isProUser]);

  const pullTokensFromGitLab = useCallback(async (context: GitlabCredentials, receivedFeatureFlags?: LDProps['flags']): Promise<RemoteResponseData | null> => {
    const storage = await storageClientFactory(context, isProUser);
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
  }, [storageClientFactory, checkAndSetAccess, isProUser]);

  const syncTokensWithGitLab = useCallback(async (context: GitlabCredentials): Promise<RemoteResponseData> => {
    try {
      const storage = await storageClientFactory(context, isProUser);
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
            const stringifiedRemoteTokens = JSON.stringify(compact([content.tokens, content.themes, TokenFormat.format]), null, 2);
            dispatch.tokenState.setLastSyncedState(stringifiedRemoteTokens);
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
    isProUser,
    dispatch.uiState,
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
    const storage = await storageClientFactory(context, isProUser);
    return storage.fetchBranches();
  }, [storageClientFactory, isProUser]);

  const createGitLabBranch = useCallback(async (context: GitlabCredentials, newBranch: string, source?: string) => {
    const storage = await storageClientFactory(context, isProUser);
    return storage.createBranch(newBranch, source);
  }, [storageClientFactory, isProUser]);

  const checkRemoteChangeForGitLab = useCallback(async (context: GitlabCredentials): Promise<boolean> => {
    const storage = await storageClientFactory(context, isProUser);
    try {
      const latestCommitDate = await storage.getLatestCommitDate();
      if (!!latestCommitDate && !!context.commitDate && new Date(latestCommitDate) > new Date(context.commitDate)) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [storageClientFactory, isProUser]);

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

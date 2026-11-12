import { t } from 'i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo, useEffect } from 'react';
import compact from 'just-compact';
import { Dispatch } from '@/app/store';
import useConfirm from '@/app/hooks/useConfirm';
import usePushDialog from '@/app/hooks/usePushDialog';
import { notifyToUI } from '@/plugin/notifiers';
import {
  apiSelector,
  activeThemeSelector,
  storeTokenIdInJsonEditorSelector,
  localApiStateSelector,
  themesListSelector,
  tokensSelector,
  usedTokenSetSelector,
} from '@/selectors';
import { GiteaTokenStorage } from '@/storage/GiteaTokenStorage';
import { isEqual } from '@/utils/isEqual';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { getRepositoryInformation } from '../getRepositoryInformation';
import { RemoteResponseData } from '@/types/RemoteResponseData';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { applyTokenSetOrder } from '@/utils/tokenset';
import { PushOverrides } from '../../remoteTokens';
import { useIsProUser } from '@/app/hooks/useIsProUser';
import { categorizeError } from '@/utils/error/categorizeError';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';
import removeIdPropertyFromTokens from '@/utils/removeIdPropertyFromTokens';

export type GiteaCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.GITEA }>;
type GiteaFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.GITEA }>;

export const clientFactory = async (context: GiteaCredentials, isProUser: boolean) => {
  const {
    secret, baseUrl, id, filePath, branch, commitSha, previousSourceBranch,
  } = context;
  if (!id || id.split('/').length !== 2 || id.split('/').some((part) => !part)) {
    throw new Error(t('storage:giteaRepositoryFormat', { defaultValue: 'Gitea repository must be owner/repository' }));
  }
  const { ownerId, repositoryId } = getRepositoryInformation(id);
  const storageClient = new GiteaTokenStorage(secret, ownerId, repositoryId, baseUrl, commitSha, previousSourceBranch);
  storageClient.changePath(filePath);
  if (branch) storageClient.selectBranch(branch);
  if (isProUser) storageClient.enableMultiFile();
  return storageClient;
};

export function useGitea() {
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const localApiState = useSelector(localApiStateSelector) as GiteaCredentials;
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const storeTokenIdInJsonEditor = useSelector(storeTokenIdInJsonEditorSelector);
  const connectedApiState = useSelector(apiSelector);
  const isProUser = useIsProUser();
  const dispatch = useDispatch<Dispatch>();

  const { confirm } = useConfirm();
  const { pushDialog, closePushDialog } = usePushDialog();

  const storageClientFactory = useCallback(clientFactory, []);

  const askUserIfPull = useCallback(async () => {
    const confirmResult = await confirm({
      text: t('storage:giteaPullTitle', { defaultValue: 'Pull from Gitea?' }),
      description: t('storage:giteaPullDescription', {
        defaultValue: 'Your repo already contains tokens, do you want to pull these now?',
      }),
    });
    return confirmResult;
  }, [confirm]);

  const pushTokensToGitea = useCallback(
    async (context: GiteaCredentials, overrides?: PushOverrides): Promise<RemoteResponseData> => {
      const pushSettings = await pushDialog({ state: 'initial', overrides: overrides ?? { branch: context.branch, commitMessage: '' } });
      if (pushSettings) {
        const { commitMessage, customBranch } = pushSettings;
        try {
          const storage = await storageClientFactory(
            customBranch ? { ...context, previousSourceBranch: context.branch } : context,
            isProUser,
          );
          if (customBranch) storage.selectBranch(customBranch);
          const metadata = {
            tokenSetOrder: Object.keys(tokens),
          };
          const saved = await storage.save(
            {
              themes,
              tokens,
              metadata,
            },
            {
              commitMessage,
              storeTokenIdInJsonEditor,
            },
          );
          if (!saved) throw new Error(t('storage:giteaSaveNotConfirmed', { defaultValue: 'Gitea did not confirm the save.' }));
          dispatch.tokenState.setEditProhibited(false);
          const commitSha = storage.lastCommitSha;
          dispatch.uiState.setLocalApiState({
            ...context,
            branch: customBranch || context.branch,
            defaultBranch: storage.defaultBranch,
            commitSha,
          } as GiteaCredentials);
          dispatch.uiState.setApiData({
            ...context,
            branch: customBranch || context.branch,
            defaultBranch: storage.defaultBranch,
            commitSha,
          });
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

          const stringifiedRemoteTokens = JSON.stringify(
            compact([removeIdPropertyFromTokens(tokens), themes, TokenFormat.format]),
            null,
            2,
          );
          dispatch.tokenState.setLastSyncedState(stringifiedRemoteTokens);
          pushDialog({ state: 'success' });
          return {
            status: 'success',
            tokens,
            themes,
            metadata,
            defaultBranch: storage.defaultBranch,
            branch: customBranch || context.branch,
            canWrite: true,
            commitSha,
          };
        } catch (e: any) {
          closePushDialog();
          dispatch.uiState.setLocalApiState(localApiState);
          console.log('Error pushing to Gitea', e);
          if (e instanceof Error) {
            return {
              status: 'failure',
              errorMessage: e.message,
            };
          }
          const { message } = categorizeError(e, {
            provider: StorageProviderType.GITEA,
            operation: 'push',
            hasCredentials: true,
          });
          return {
            status: 'failure',
            errorMessage: message,
          };
        }
      }
      dispatch.uiState.setLocalApiState(localApiState);
      return {
        status: 'failure',
        errorMessage: t('storage:giteaPushCancelled', { defaultValue: 'Push to remote cancelled!' }),
      };
    },
    [
      dispatch,
      storageClientFactory,
      pushDialog,
      closePushDialog,
      tokens,
      themes,
      usedTokenSet,
      activeTheme,
      isProUser,
      storeTokenIdInJsonEditor,
      localApiState,
    ],
  );

  // Only the committed provider participates in license refresh; dialog drafts do not change access.
  useEffect(() => {
    let active = true;
    if (isProUser && connectedApiState && 'id' in connectedApiState && connectedApiState.id && connectedApiState.provider === 'gitea') {
      const context = connectedApiState as GiteaCredentials;
      const refreshAccess = async () => {
        const storage = await storageClientFactory(context, isProUser);
        storage.enableMultiFile();
        const canWrite = await storage.canWrite();
        if (active) dispatch.tokenState.setEditProhibited(!canWrite);
      };
      refreshAccess().catch((error) => {
        if (active) notifyToUI(error instanceof Error ? error.message : String(error), { error: true });
      });
    }
    return () => { active = false; };
  }, [isProUser, connectedApiState, storageClientFactory, dispatch]);

  const pullTokensFromGitea = useCallback(
    async (context: GiteaCredentials): Promise<RemoteResponseData | null> => {
      const storage = await storageClientFactory(context, isProUser);
      try {
        const canWrite = await storage.canWrite();
        const content = await storage.retrieve();
        if (content?.status === 'failure') {
          return {
            status: 'failure',
            errorMessage: content.errorMessage,
          };
        }

        if (content) {
          // If we didn't get a tokenSetOrder from metadata, use the order of the token sets as they appeared
          const sortedTokens = applyTokenSetOrder(
            content.tokens,
            content.metadata?.tokenSetOrder ?? Object.keys(content.tokens),
          );
          return {
            ...content,
            tokens: sortedTokens,
            canWrite,
            defaultBranch: storage.defaultBranch,
            commitSha: storage.lastCommitSha,
          };
        }
      } catch (e) {
        console.log('Error', e);
        const message = e instanceof Error ? e.message : String(e);
        return {
          status: 'failure',
          errorMessage: message,
        };
      }
      return null;
    },
    [storageClientFactory, isProUser],
  );

  const syncTokensWithGitea = useCallback(
    async (context: GiteaCredentials): Promise<RemoteResponseData> => {
      try {
        const storage = await storageClientFactory(context, isProUser);
        const hasBranches = await storage.fetchBranches();
        const canWrite = await storage.canWrite();

        if (!hasBranches || !hasBranches.length) {
          return {
            status: 'failure',
            errorMessage: ErrorMessages.EMPTY_BRANCH_ERROR,
          };
        }

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
            if (!userDecision) {
              return {
                status: 'failure',
                errorMessage: t('storage:giteaPullCancelled', { defaultValue: 'Pull from Gitea cancelled.' }),
              };
            }
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
              const stringifiedRemoteTokens = JSON.stringify(
                compact([content.tokens, content.themes, TokenFormat.format]),
                null,
                2,
              );
              dispatch.tokenState.setLastSyncedState(stringifiedRemoteTokens);
              dispatch.tokenState.setCollapsedTokenSets([]);
              dispatch.uiState.setApiData({
                ...context,
                defaultBranch: storage.defaultBranch,
                commitSha: storage.lastCommitSha,
              });
              notifyToUI(t('storage:giteaPulled', { defaultValue: 'Pulled tokens from Gitea' }));
            }
          }
          dispatch.tokenState.setEditProhibited(!canWrite);
          dispatch.branchState.setBranches(hasBranches);
          dispatch.uiState.setApiData({ ...context, defaultBranch: storage.defaultBranch, commitSha: storage.lastCommitSha });
          dispatch.uiState.setLocalApiState({ ...context, defaultBranch: storage.defaultBranch, commitSha: storage.lastCommitSha });
          return { ...content, defaultBranch: storage.defaultBranch, commitSha: storage.lastCommitSha };
        }
        return await pushTokensToGitea({ ...context, defaultBranch: storage.defaultBranch, commitSha: storage.lastCommitSha });
      } catch (err) {
        const type = err instanceof SyntaxError ? 'parsing' : 'other';
        const message = err instanceof Error ? err.message : String(err);
        console.log('Error', err);

        if (type === 'parsing') {
          notifyToUI(t('storage:giteaParseError', { defaultValue: 'Failed to parse token file - check JSON format' }), {
            error: true,
          });
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
    },
    [
      storageClientFactory,
      dispatch.branchState,
      dispatch.tokenState,
      pushTokensToGitea,
      tokens,
      themes,
      askUserIfPull,
      usedTokenSet,
      activeTheme,
      isProUser,
      dispatch.uiState,
    ],
  );

  const addNewGiteaCredentials = useCallback(
    async (context: GiteaFormValues): Promise<RemoteResponseData> => {
      const previousBranch = localApiState.branch;
      if (previousBranch !== context.branch) {
        context = { ...context, previousSourceBranch: previousBranch };
      }
      const data = await syncTokensWithGitea(context);

      if (data.status === 'success') {
        AsyncMessageChannel.ReactInstance.message({
          type: AsyncMessageTypes.CREDENTIALS,
          credential: {
            ...context, ...(data.branch ? { branch: data.branch } : {}), defaultBranch: data.defaultBranch, commitSha: data.commitSha,
          },
        });
        if (!data.tokens) {
          notifyToUI(t('storage:giteaNoTokens', { defaultValue: 'No tokens stored on remote' }));
        }
      } else {
        // Go back to the previous setup if the user cancelled pushing to the remote or there was an error
        dispatch.uiState.setLocalApiState(localApiState);
        return {
          status: 'failure',
          errorMessage: data.errorMessage,
        };
      }
      return {
        status: 'success',
        tokens: data.tokens ?? tokens,
        themes: data.themes ?? themes,
        metadata: data.metadata,
        branch: data.branch,
        canWrite: data.canWrite,
        defaultBranch: data.defaultBranch,
        commitSha: data.commitSha,
      };
    },
    [syncTokensWithGitea, localApiState, dispatch, tokens, themes],
  );

  const fetchGiteaBranches = useCallback(
    async (context: GiteaCredentials) => {
      const storage = await storageClientFactory(context, isProUser);
      return storage.fetchBranches();
    },
    [storageClientFactory, isProUser],
  );

  const createGiteaBranch = useCallback(
    async (context: GiteaCredentials, newBranch: string, source?: string) => {
      const storage = await storageClientFactory(context, isProUser);
      return storage.createBranch(newBranch, source);
    },
    [storageClientFactory, isProUser],
  );

  const checkRemoteChangeForGitea = useCallback(
    async (context: GiteaCredentials): Promise<boolean> => {
      const storage = await storageClientFactory(context, isProUser);
      const sha = await storage.getCommitSha();
      return !!context.commitSha && sha !== context.commitSha;
    },
    [storageClientFactory, isProUser],
  );

  return useMemo(
    () => ({
      addNewGiteaCredentials,
      syncTokensWithGitea,
      pullTokensFromGitea,
      pushTokensToGitea,
      fetchGiteaBranches,
      createGiteaBranch,
      checkRemoteChangeForGitea,
    }),
    [
      addNewGiteaCredentials,
      syncTokensWithGitea,
      pullTokensFromGitea,
      pushTokensToGitea,
      fetchGiteaBranches,
      createGiteaBranch,
      checkRemoteChangeForGitea,
    ],
  );
}

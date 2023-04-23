import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { useFlags } from 'launchdarkly-react-client-sdk';
import { LDProps } from 'launchdarkly-react-client-sdk/lib/withLDConsumer';
import { Dispatch } from '@/app/store';
import useConfirm from '@/app/hooks/useConfirm';
import usePushDialog from '@/app/hooks/usePushDialog';
import { notifyToUI } from '@/plugin/notifiers';
import {
  activeThemeSelector, localApiStateSelector, themesListSelector, tokensSelector, usedTokenSetSelector,
} from '@/selectors';
import { BitbucketTokenStorage } from '@/storage/BitbucketTokenStorage';
import { isEqual } from '@/utils/isEqual';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { saveLastSyncedState } from '@/utils/saveLastSyncedState';
import { applyTokenSetOrder } from '@/utils/tokenset';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { RemoteResponseData } from '@/types/RemoteResponseData';

type BitbucketCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.BITBUCKET }>;
type BitbucketFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.BITBUCKET }>;

export function useBitbucket() {
  const tokens = useSelector(tokensSelector);
  const activeTheme = useSelector(activeThemeSelector);

  const themes = useSelector(themesListSelector);
  const localApiState = useSelector(localApiStateSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const { multiFileSync } = useFlags();
  const dispatch = useDispatch<Dispatch>();
  const { confirm } = useConfirm();
  const { pushDialog, closePushDialog } = usePushDialog();

  const storageClientFactory = useCallback(
    (context: BitbucketCredentials, owner?: string, repo?: string) => {
      const splitContextId = context.id.split('/');
      const storageClient = new BitbucketTokenStorage(
        context.secret,
        owner ?? splitContextId[0],
        repo ?? splitContextId[1],
        context.baseUrl ?? '',
      );
      if (context.filePath) storageClient.changePath(context.filePath);
      if (context.branch) storageClient.selectBranch(context.branch);
      if (multiFileSync) storageClient.enableMultiFile();
      return storageClient;
    },
    [multiFileSync],
  );

  const askUserIfPull = useCallback(async () => {
    const confirmResult = await confirm({
      text: 'Pull from Bitbucket?',
      description: 'Your repo already contains tokens, do you want to pull these now?',
    });
    return confirmResult;
  }, [confirm]);

  const pushTokensToBitbucket = useCallback(async (context: BitbucketCredentials): Promise<RemoteResponseData> => {
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
        }, { commitMessage });
        saveLastSyncedState(dispatch, tokens, themes, metadata);
        dispatch.uiState.setLocalApiState({ ...localApiState, branch: customBranch } as BitbucketCredentials);
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
        console.log('Error pushing to Bitbucket', e);
        if (e instanceof Error && e.message === ErrorMessages.GIT_MULTIFILE_PERMISSION_ERROR) {
          return {
            status: 'failure',
            errorMessage: ErrorMessages.GIT_MULTIFILE_PERMISSION_ERROR,
          };
        }
        return {
          status: 'failure',
          errorMessage: ErrorMessages.BITBUCKET_CREDENTIAL_ERROR,
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

  const checkAndSetAccess = useCallback(
    async ({
      context, owner, repo, receivedFeatureFlags,
    }: { context: BitbucketCredentials; owner: string; repo: string, receivedFeatureFlags?: LDProps['flags'] }) => {
      const storage = storageClientFactory(context, owner, repo);
      if (receivedFeatureFlags?.multiFileSync) storage.enableMultiFile();
      const hasWriteAccess = await storage.canWrite();
      dispatch.tokenState.setEditProhibited(!hasWriteAccess);
    },
    [dispatch, storageClientFactory],
  );

  const pullTokensFromBitbucket = useCallback(
    async (context: BitbucketCredentials, receivedFeatureFlags?: LDProps['flags']): Promise<RemoteResponseData | null> => {
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
          return content;
        }
      } catch (e) {
        console.log('Error', e);
        return {
          status: 'failure',
          errorMessage: ErrorMessages.BITBUCKET_CREDENTIAL_ERROR,
        };
      }
      return null;
    },
    [checkAndSetAccess, storageClientFactory],
  );

  // Function to initially check auth and sync tokens with Bitbucket
  const syncTokensWithBitbucket = useCallback(
    async (context: BitbucketCredentials): Promise<RemoteResponseData> => {
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
              const sortedValues = applyTokenSetOrder(content.tokens, content.metadata?.tokenSetOrder);
              saveLastSyncedState(dispatch, sortedValues, content.themes, content.metadata);
              dispatch.tokenState.setTokenData({
                values: content.tokens,
                themes: content.themes,
                activeTheme,
                usedTokenSet,
              });
              dispatch.tokenState.setCollapsedTokenSets([]);
              notifyToUI('Pulled tokens from Bitbucket');
            }
          }
          return content;
        }
        return await pushTokensToBitbucket(context);
      } catch (e) {
        notifyToUI(ErrorMessages.BITBUCKET_CREDENTIAL_ERROR, { error: true });
        console.log('Error', e);
        return {
          status: 'failure',
          errorMessage: ErrorMessages.BITBUCKET_CREDENTIAL_ERROR,
        };
      }
    },
    [
      askUserIfPull,
      dispatch,
      pushTokensToBitbucket,
      storageClientFactory,
      usedTokenSet,
      activeTheme,
      themes,
      tokens,
      checkAndSetAccess,
    ],
  );

  const addNewBitbucketCredentials = useCallback(
    async (context: BitbucketFormValues): Promise<RemoteResponseData> => {
      const data = await syncTokensWithBitbucket(context);
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
      syncTokensWithBitbucket,
      tokens,
      themes,
    ],
  );

  const fetchBitbucketBranches = useCallback(
    async (context: BitbucketCredentials) => {
      const storage = storageClientFactory(context);
      return storage.fetchBranches();
    },
    [storageClientFactory],
  );

  const createBitbucketBranch = useCallback(
    (context: BitbucketCredentials, newBranch: string, source?: string) => {
      const storage = storageClientFactory(context);
      return storage.createBranch(newBranch, source);
    },
    [storageClientFactory],
  );

  return useMemo(
    () => ({
      addNewBitbucketCredentials,
      syncTokensWithBitbucket,
      pullTokensFromBitbucket,
      pushTokensToBitbucket,
      fetchBitbucketBranches,
      createBitbucketBranch,
    }),
    [
      addNewBitbucketCredentials,
      syncTokensWithBitbucket,
      pullTokensFromBitbucket,
      pushTokensToBitbucket,
      fetchBitbucketBranches,
      createBitbucketBranch,
    ],
  );
}

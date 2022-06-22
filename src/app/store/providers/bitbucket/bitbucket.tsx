import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { useFlags } from 'launchdarkly-react-client-sdk';
import { LDProps } from 'launchdarkly-react-client-sdk/lib/withLDConsumer';
import { Dispatch } from '@/app/store';
import useConfirm from '@/app/hooks/useConfirm';
import usePushDialog from '@/app/hooks/usePushDialog';
import { notifyToUI } from '@/plugin/notifiers';
import { localApiStateSelector, themesListSelector, tokensSelector, usedTokenSetSelector } from '@/selectors';
import { BitbucketTokenStorage } from '@/storage/BitbucketTokenStorage';
import { isEqual } from '@/utils/isEqual';
import { RemoteTokenStorageData } from '@/storage/RemoteTokenStorage';
import { GitStorageMetadata } from '@/storage/GitTokenStorage';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';

type BitbucketCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.BITBUCKET }>;
type BitbucketFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.BITBUCKET }>;

export function useBitbucket() {
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const localApiState = useSelector(localApiStateSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const { multiFileSync } = useFlags();
  const dispatch = useDispatch<Dispatch>();
  const { confirm } = useConfirm();
  const { pushDialog } = usePushDialog();

  const storageClientFactory = useCallback(
    (context: BitbucketCredentials, owner?: string, repo?: string) => {
      const splitContextId = context.id.split('/');
      const storageClient = new BitbucketTokenStorage(
        context.secret,
        owner ?? splitContextId[0],
        repo ?? splitContextId[1],
        context.baseUrl ?? ''
      );

      if (context.filePath) storageClient.changePath(context.filePath);
      if (context.branch) storageClient.selectBranch(context.branch);
      if (multiFileSync) storageClient.enableMultiFile();
      return storageClient;
    },
    [multiFileSync]
  );

  const askUserIfPull = useCallback(async () => {
    const confirmResult = await confirm({
      text: 'Pull from Bitbucket?',
      description: 'Your repo already contains tokens, do you want to pull these now?',
    });
    if (confirmResult === false) return false;
    return confirmResult.result;
  }, [confirm]);

  const pushTokensToBitbucket = useCallback(
    async (context: BitbucketCredentials): Promise<RemoteTokenStorageData<GitStorageMetadata> | null> => {
      const storage = storageClientFactory(context);
      const content = await storage.retrieve();

      if (content) {
        if (content && isEqual(content.tokens, tokens) && isEqual(content.themes, themes)) {
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
          dispatch.uiState.setLocalApiState({ ...localApiState, branch: customBranch } as BitbucketCredentials);
          dispatch.uiState.setApiData({ ...context, branch: customBranch });
          dispatch.tokenState.setTokenData({
            values: tokens,
            themes,
            usedTokenSet,
          });
          pushDialog('success');
          return {
            tokens,
            themes,
            metadata: { commitMessage },
          };
        } catch (e) {
          console.log('Error pushing to Bitbucket', e);
        }
      }

      return {
        tokens,
        themes,
        metadata: {},
      };
    },
    [
      storageClientFactory,
      dispatch.uiState,
      dispatch.tokenState,
      pushDialog,
      tokens,
      themes,
      localApiState,
      usedTokenSet,
    ]
  );

  const checkAndSetAccess = useCallback(
    async ({ context, owner, repo }: { context: BitbucketCredentials; owner: string; repo: string }) => {
      const storage = storageClientFactory(context, owner, repo);
      const hasWriteAccess = await storage.canWrite();
      dispatch.tokenState.setEditProhibited(!hasWriteAccess);
    },
    [dispatch, storageClientFactory]
  );

  const pullTokensFromBitbucket = useCallback(
    async (context: BitbucketCredentials, receivedFeatureFlags?: LDProps['flags']) => {
      const storage = storageClientFactory(context);
      if (receivedFeatureFlags?.multiFileSync) storage.enableMultiFile();

      const [owner, repo] = context.id.split('/');

      await checkAndSetAccess({ context, owner, repo });

      try {
        const content = await storage.retrieve();
        if (content) {
          return content;
        }
      } catch (e) {
        console.log('Error', e);
      }
      return null;
    },
    [checkAndSetAccess, storageClientFactory]
  );

  // Function to initially check auth and sync tokens with Bitbucket
  const syncTokensWithBitbucket = useCallback(
    async (context: BitbucketCredentials): Promise<RemoteTokenStorageData<GitStorageMetadata> | null> => {
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
        if (content) {
          if (!isEqual(content.tokens, tokens) || !isEqual(content.themes, themes)) {
            const userDecision = await askUserIfPull();
            if (userDecision) {
              dispatch.tokenState.setLastSyncedState(JSON.stringify([content.tokens, content.themes], null, 2));
              dispatch.tokenState.setTokenData({
                values: content.tokens,
                themes: content.themes,
                usedTokenSet,
              });
              notifyToUI('Pulled tokens from GitHub');
            }
          }
          return content;
        }
        return await pushTokensToBitbucket(context);
      } catch (e) {
        notifyToUI('Error syncing with Bitbucket, check credentials', { error: true });
        console.log('Error', e);
        return null;
      }
    },
    [askUserIfPull, dispatch, pushTokensToBitbucket, storageClientFactory, themes, tokens]
  );

  const addNewBitbucketCredentials = useCallback(
    async (context: BitbucketFormValues): Promise<RemoteTokenStorageData<GitStorageMetadata> | null> => {
      const data = await syncTokensWithBitbucket(context);
      if (data) {
        AsyncMessageChannel.message({
          type: AsyncMessageTypes.CREDENTIALS,
          credential: context,
        });
        if (data?.tokens) {
          dispatch.tokenState.setLastSyncedState(JSON.stringify([data.tokens, data.themes], null, 2));
          dispatch.tokenState.setTokenData({
            values: data.tokens,
            themes: data.themes,
            usedTokenSet,
          });
        } else {
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
    },
    [syncTokensWithBitbucket, tokens, themes, dispatch.tokenState, usedTokenSet]
  );

  const fetchBitbucketBranches = useCallback(
    async (context: BitbucketCredentials) => {
      const storage = storageClientFactory(context);
      return storage.fetchBranches();
    },
    [storageClientFactory]
  );

  const createBitbucketBranch = useCallback(
    (context: BitbucketCredentials, newBranch: string, source?: string) => {
      const storage = storageClientFactory(context);
      return storage.createBranch(newBranch, source);
    },
    [storageClientFactory]
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
    ]
  );
}

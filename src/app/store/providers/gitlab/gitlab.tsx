import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { useFlags } from 'launchdarkly-react-client-sdk';
import { LDProps } from 'launchdarkly-react-client-sdk/lib/withLDConsumer';
import { Dispatch } from '@/app/store';
import { MessageToPluginTypes } from '@/types/messages';
import useConfirm from '@/app/hooks/useConfirm';
import usePushDialog from '@/app/hooks/usePushDialog';
import { ContextObject } from '@/types/api';
import { notifyToUI, postToFigma } from '@/plugin/notifiers';
import {
  localApiStateSelector, themesListSelector, tokensSelector,
} from '@/selectors';
import { GitlabTokenStorage } from '@/storage/GitlabTokenStorage';
import { isEqual } from '@/utils/isEqual';
import { RemoteTokenStorageData } from '@/storage/RemoteTokenStorage';
import { GitStorageMetadata } from '@/storage/GitTokenStorage';

export function useGitLab() {
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const localApiState = useSelector(localApiStateSelector);
  const { multiFileSync } = useFlags();
  const dispatch = useDispatch<Dispatch>();

  const { confirm } = useConfirm();
  const { pushDialog } = usePushDialog();

  const storageClientFactory = useCallback(async (context: ContextObject, owner?: string, repo?: string) => {
    const splitContextId = context.id.split('/');
    const storageClient = new GitlabTokenStorage(context.secret, owner ?? splitContextId[0], repo ?? splitContextId[1], context.baseUrl ?? '');
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
    if (confirmResult === false) return false;
    return confirmResult.result;
  }, [confirm]);

  const pushTokensToGitLab = useCallback(async (context: ContextObject) => {
    const storage = await storageClientFactory(context);

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
        dispatch.uiState.setLocalApiState({ ...localApiState, branch: customBranch });
        dispatch.uiState.setApiData({ ...context, branch: customBranch });
        dispatch.tokenState.setLastSyncedState(JSON.stringify([tokens, themes], null, 2));
        dispatch.tokenState.setTokenData({
          values: tokens,
          themes,
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
    tokens,
    themes,
    pushDialog,
    localApiState,
  ]);

  const checkAndSetAccess = useCallback(async ({ context, owner, repo }: { context: ContextObject; owner: string; repo: string }) => {
    const storage = await storageClientFactory(context, owner, repo);
    const hasWriteAccess = await storage.canWrite();
    dispatch.tokenState.setEditProhibited(!hasWriteAccess);
  }, [dispatch, storageClientFactory]);

  const pullTokensFromGitLab = useCallback(async (context: ContextObject, receivedFeatureFlags?: LDProps['flags']) => {
    const storage = await storageClientFactory(context);
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
  }, [storageClientFactory, checkAndSetAccess]);

  const syncTokensWithGitLab = useCallback(async (context: ContextObject): Promise<RemoteTokenStorageData<GitStorageMetadata> | null> => {
    try {
      const storage = await storageClientFactory(context);
      const hasBranches = await storage.fetchBranches();

      if (!hasBranches || !hasBranches.length) {
        return null;
      }

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
    askUserIfPull,
    dispatch,
    pushTokensToGitLab,
    themes,
    tokens,
  ]);

  const addNewGitLabCredentials = useCallback(async (context: ContextObject): Promise<RemoteTokenStorageData<GitStorageMetadata> | null> => {
    const data = await syncTokensWithGitLab(context);
    if (data) {
      postToFigma({
        type: MessageToPluginTypes.CREDENTIALS,
        ...context,
      });
      if (data?.tokens) {
        dispatch.tokenState.setLastSyncedState(JSON.stringify([data.tokens, data.themes], null, 2));
        dispatch.tokenState.setTokenData({
          values: data.tokens,
          themes: data.themes,
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
  }, [
    dispatch,
    tokens,
    themes,
    syncTokensWithGitLab,
  ]);

  return useMemo(() => ({
    addNewGitLabCredentials,
    syncTokensWithGitLab,
    pullTokensFromGitLab,
    pushTokensToGitLab,
  }), [
    addNewGitLabCredentials,
    syncTokensWithGitLab,
    pullTokensFromGitLab,
    pushTokensToGitLab,
  ]);
}

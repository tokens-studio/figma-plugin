import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { Dispatch } from '@/app/store';
import { MessageToPluginTypes } from '@/types/messages';
import convertTokensToObject from '@/utils/convertTokensToObject';
import useConfirm from '@/app/hooks/useConfirm';
import usePushDialog from '@/app/hooks/usePushDialog';
import { ContextObject } from '@/types/api';
import { notifyToUI, postToFigma } from '@/plugin/notifiers';
import { FeatureFlags } from '@/utils/featureFlags';
import { TokenValues } from '@/types/tokens';
import {
  featureFlagsSelector, localApiStateSelector, themesListSelector, tokensSelector,
} from '@/selectors';
import { hasSameContent } from './hasSameContent';
import { fetchBranches } from './fetchBranches';
import { checkPermissions } from './checkPermissions';
import { readContents } from './readContents';
import { writeTokensToGitHubFactory } from './writeTokensToGitHubFactory';
import { pushTokensToGithubFactory } from './pushTokensToGitHubFactory';

export function useGitHub() {
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const localApiState = useSelector(localApiStateSelector);
  const featureFlags = useSelector(featureFlagsSelector);
  const dispatch = useDispatch<Dispatch>();
  const { confirm } = useConfirm();
  const { pushDialog } = usePushDialog();

  const askUserIfPull = useCallback(async () => {
    const confirmResult = await confirm({
      text: 'Pull from GitHub?',
      description: 'Your repo already contains tokens, do you want to pull these now?',
    });
    if (confirmResult === false) return false;
    return confirmResult.result;
  }, [confirm]);

  const getTokenObj = useCallback(() => {
    const raw = convertTokensToObject(tokens);
    const string = JSON.stringify(raw, null, 2);
    return { raw, string };
  }, [tokens]);

  const writeTokensToGitHub = useMemo(() => (
    writeTokensToGitHubFactory(dispatch, featureFlags ?? {})
  ), [dispatch, featureFlags]);

  const pushTokensToGitHub = useMemo(() => (
    pushTokensToGithubFactory(
      dispatch,
      pushDialog,
      writeTokensToGitHub,
      localApiState,
      getTokenObj(),
      themes,
      featureFlags,
    )
  ), [
    dispatch,
    pushDialog,
    writeTokensToGitHub,
    localApiState,
    getTokenObj,
    themes,
    featureFlags,
  ]);

  const checkAndSetAccess = useCallback(async ({ context, owner, repo }: { context: ContextObject; owner: string; repo: string }) => {
    const hasWriteAccess = await checkPermissions({ context, owner, repo });
    dispatch.tokenState.setEditProhibited(!hasWriteAccess);
  }, [dispatch]);

  const pullTokensFromGitHub = useCallback(async (context: ContextObject, receivedFeatureFlags?: FeatureFlags) => {
    const multiFile = receivedFeatureFlags ? receivedFeatureFlags.gh_mfs_enabled : featureFlags?.gh_mfs_enabled;

    const [owner, repo] = context.id.split('/');

    await checkAndSetAccess({ context, owner, repo });

    try {
      const content = await readContents({
        context,
        owner,
        repo,
        opts: { multiFile: Boolean(multiFile) },
      });

      if (content) {
        return content;
      }
    } catch (e) {
      console.log('Error', e);
    }
    return null;
  }, [checkAndSetAccess, featureFlags]);

  // Function to initially check auth and sync tokens with GitHub
  const syncTokensWithGitHub = useCallback(async (context: ContextObject): Promise<TokenValues | null> => {
    try {
      const [owner, repo] = context.id.split('/');
      const hasBranches = await fetchBranches({ context, owner, repo });

      if (!hasBranches) {
        return null;
      }

      const content = await pullTokensFromGitHub(context);

      const { string: tokenObj } = getTokenObj();

      if (content) {
        if (!hasSameContent(content, tokenObj)) {
          const userDecision = await askUserIfPull();
          if (userDecision) {
            dispatch.tokenState.setLastSyncedState(JSON.stringify(content.values, null, 2));
            dispatch.tokenState.setTokenData(content);
            notifyToUI('Pulled tokens from GitHub');
            return content;
          }
          return { values: tokenObj };
        }
        return content;
      }
      return await pushTokensToGitHub(context);
    } catch (e) {
      notifyToUI('Error syncing with GitHub, check credentials', { error: true });
      console.log('Error', e);
      return null;
    }
  }, [askUserIfPull, dispatch, getTokenObj, pushTokensToGitHub, pullTokensFromGitHub]);

  const addNewGitHubCredentials = useCallback(async (context: ContextObject): Promise<TokenValues | null> => {
    let { raw: rawTokenObj } = getTokenObj();

    const data = await syncTokensWithGitHub(context);

    if (data) {
      postToFigma({
        type: MessageToPluginTypes.CREDENTIALS,
        ...context,
      });
      if (data?.values) {
        dispatch.tokenState.setLastSyncedState(JSON.stringify(data.values, null, 2));
        dispatch.tokenState.setTokenData(data);
        rawTokenObj = data.values;
      } else {
        notifyToUI('No tokens stored on remote');
      }
    } else {
      return null;
    }

    return {
      values: rawTokenObj,
    };
  }, [dispatch, getTokenObj, syncTokensWithGitHub]);

  return useMemo(() => ({
    addNewGitHubCredentials,
    syncTokensWithGitHub,
    pullTokensFromGitHub,
    pushTokensToGitHub,
  }), [
    addNewGitHubCredentials,
    syncTokensWithGitHub,
    pullTokensFromGitHub,
    pushTokensToGitHub,
  ]);
}

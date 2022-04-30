import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { ContextObject, StorageProviderType } from '@/types/api';
import { MessageToPluginTypes } from '@/types/messages';
import { track } from '@/utils/analytics';
import { postToFigma } from '../../plugin/notifiers';
import { useJSONbin } from './providers/jsonbin';
import useURL from './providers/url';
import { Dispatch } from '../store';
import useStorage from './useStorage';
import { useGitHub } from './providers/github';
import { useGitLab } from './providers/gitlab';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { FeatureFlags } from '@/utils/featureFlags';
import { apiSelector } from '@/selectors';
import { UsedTokenSetsMap } from '@/types';
import { RemoteTokenStorageData } from '@/storage/RemoteTokenStorage';

type PullTokensOptions = {
  context?: ContextObject,
  featureFlags?: FeatureFlags,
  usedTokenSet?: UsedTokenSetsMap | null
};

// @TODO typings and hooks

export default function useRemoteTokens() {
  const dispatch = useDispatch<Dispatch>();
  const api = useSelector(apiSelector);

  const { setStorageType } = useStorage();
  const { pullTokensFromJSONBin, addJSONBinCredentials, createNewJSONBin } = useJSONbin();
  const {
    addNewGitHubCredentials, syncTokensWithGitHub, pullTokensFromGitHub, pushTokensToGitHub, createGithubBranch, fetchGithubBranches,
  } = useGitHub();
  const {
    addNewGitLabCredentials, syncTokensWithGitLab, pullTokensFromGitLab, pushTokensToGitLab,
  } = useGitLab();
  const { pullTokensFromURL } = useURL();

  const pullTokens = useCallback(async ({ context = api, featureFlags, usedTokenSet }: PullTokensOptions) => {
    track('pullTokens', { provider: context.provider });

    dispatch.uiState.startJob({
      name: BackgroundJobs.UI_PULLTOKENS,
      isInfinite: true,
    });

    let remoteData: RemoteTokenStorageData<unknown> | null = null;

    switch (context.provider) {
      case StorageProviderType.JSONBIN: {
        remoteData = await pullTokensFromJSONBin(context);
        break;
      }
      case StorageProviderType.GITHUB: {
        remoteData = await pullTokensFromGitHub(context, featureFlags);
        break;
      }
      case StorageProviderType.GITLAB: {
        remoteData = await pullTokensFromGitLab(context, featureFlags);
        break;
      }
      case StorageProviderType.URL: {
        remoteData = await pullTokensFromURL(context);
        break;
      }
      default:
        throw new Error('Not implemented');
    }

    if (remoteData) {
      dispatch.tokenState.setLastSyncedState(JSON.stringify([remoteData.tokens, remoteData.themes], null, 2));
      dispatch.tokenState.setTokenData({
        values: remoteData.tokens,
        themes: remoteData.themes,
        usedTokenSet: usedTokenSet ?? {},
      });
      track('Launched with token sets', {
        count: Object.keys(remoteData.tokens).length,
        setNames: Object.keys(remoteData.tokens),
      });
    }

    dispatch.uiState.completeJob(BackgroundJobs.UI_PULLTOKENS);
  }, [
    dispatch,
    api,
    pullTokensFromGitHub,
    pullTokensFromGitLab,
    pullTokensFromJSONBin,
    pullTokensFromURL,
  ]);

  const restoreStoredProvider = useCallback(async (context: ContextObject) => {
    track('restoreStoredProvider', { provider: context.provider });
    dispatch.uiState.setLocalApiState(context);
    dispatch.uiState.setApiData(context);
    dispatch.tokenState.setEditProhibited(false);
    setStorageType({ provider: context, shouldSetInDocument: true });
    switch (context.provider) {
      case StorageProviderType.GITHUB: {
        await syncTokensWithGitHub(context);
        break;
      }
      case StorageProviderType.GITLAB: {
        await syncTokensWithGitLab(context);
        break;
      }
      default:
        await pullTokens({ context });
    }
    return null;
  }, [
    dispatch,
    setStorageType,
    pullTokens,
    syncTokensWithGitHub,
    syncTokensWithGitLab,
  ]);

  const pushTokens = useCallback(async (context: ContextObject = api) => {
    track('pushTokens', { provider: api.provider });
    switch (api.provider) {
      case StorageProviderType.GITHUB: {
        await pushTokensToGitHub(context);
        break;
      }
      case StorageProviderType.GITLAB: {
        await pushTokensToGitLab(api);
        break;
      }
      default:
        throw new Error('Not implemented');
    }
  }, [
    api,
    pushTokensToGitHub,
    pushTokensToGitLab,
  ]);

  const addNewProviderItem = useCallback(async (context: ContextObject): Promise<boolean> => {
    const credentials = context;
    let data;
    switch (context.provider) {
      case StorageProviderType.JSONBIN: {
        if (context.id) {
          data = await addJSONBinCredentials(context);
        } else {
          const id = await createNewJSONBin(context);
          if (id) {
            credentials.id = id;
            data = true;
          }
        }
        break;
      }
      case StorageProviderType.GITHUB: {
        data = await addNewGitHubCredentials(credentials);
        break;
      }
      case StorageProviderType.GITLAB: {
        data = await addNewGitLabCredentials(credentials);
        break;
      }
      case StorageProviderType.URL: {
        data = await pullTokensFromURL(context);
        break;
      }
      default:
        throw new Error('Not implemented');
    }
    if (data) {
      dispatch.uiState.setLocalApiState(credentials);
      dispatch.uiState.setApiData(credentials);
      setStorageType({ provider: credentials, shouldSetInDocument: true });
      return true;
    }
    return false;
  }, [
    dispatch,
    addJSONBinCredentials,
    addNewGitLabCredentials,
    addNewGitHubCredentials,
    createNewJSONBin,
    pullTokensFromURL,
    setStorageType,
  ]);

  const addNewBranch = useCallback(async (context: ContextObject, branch: string, source?: string) => {
    let newBranchCreated = false;
    switch (context.provider) {
      case StorageProviderType.GITHUB: {
        newBranchCreated = await createGithubBranch(context, branch, source);
        break;
      }
      default:
        throw new Error('Not implemented');
    }

    return newBranchCreated;
  }, [createGithubBranch]);

  const fetchBranches = useCallback(async (context: ContextObject) => {
    switch (context.provider) {
      case StorageProviderType.GITHUB:
        return fetchGithubBranches(context);
      default:
        return null;
    }
  }, [fetchGithubBranches]);

  const deleteProvider = useCallback((provider) => {
    postToFigma({
      type: MessageToPluginTypes.REMOVE_SINGLE_CREDENTIAL,
      context: provider,
    });
  }, []);

  return useMemo(() => ({
    restoreStoredProvider,
    deleteProvider,
    pullTokens,
    pushTokens,
    addNewProviderItem,
    fetchBranches,
    addNewBranch,
  }), [
    restoreStoredProvider,
    deleteProvider,
    pullTokens,
    pushTokens,
    addNewProviderItem,
    addNewBranch,
    fetchBranches,
  ]);
}

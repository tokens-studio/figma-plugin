import { useDispatch, useSelector } from 'react-redux';
import { ContextObject, StorageProviderType } from '@/types/api';
import { MessageToPluginTypes } from '@/types/messages';
import { track } from '@/utils/analytics';
import { postToFigma } from '../../plugin/notifiers';
import { useJSONbin } from './providers/jsonbin';
import useURL from './providers/url';
import { Dispatch } from '../store';
import useStorage from './useStorage';
import { useGitHub } from './providers/github';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { FeatureFlags } from '@/utils/featureFlags';
import { apiSelector } from '@/selectors';
import { UsedTokenSetsMap } from '@/types';

type PullTokensOptiosn = {
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
  const { pullTokensFromURL } = useURL();

  const pullTokens = async ({ context = api, featureFlags, usedTokenSet }: PullTokensOptiosn) => {
    track('pullTokens', { provider: context.provider });

    dispatch.uiState.startJob({
      name: BackgroundJobs.UI_PULLTOKENS,
      isInfinite: true,
    });

    let tokenValues;

    switch (context.provider) {
      case StorageProviderType.JSONBIN: {
        tokenValues = await pullTokensFromJSONBin(context);
        break;
      }
      case StorageProviderType.GITHUB: {
        tokenValues = await pullTokensFromGitHub(context, featureFlags);
        break;
      }
      case StorageProviderType.URL: {
        tokenValues = await pullTokensFromURL(context);
        break;
      }
      default:
        throw new Error('Not implemented');
    }

    if (tokenValues) {
      dispatch.tokenState.setLastSyncedState(JSON.stringify(tokenValues.values, null, 2));
      dispatch.tokenState.setTokenData({ ...tokenValues, usedTokenSet: usedTokenSet ?? {} });
      track('Launched with token sets', {
        count: Object.keys(tokenValues.values).length,
        setNames: Object.keys(tokenValues.values),
      });
    }

    dispatch.uiState.completeJob(BackgroundJobs.UI_PULLTOKENS);
  };

  const restoreStoredProvider = async (context) => {
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
      default:
        await pullTokens(context);
    }
    return null;
  };

  const pushTokens = async (context: ContextObject = api) => {
    track('pushTokens', { provider: api.provider });
    switch (api.provider) {
      case StorageProviderType.GITHUB: {
        await pushTokensToGitHub(context);
        break;
      }
      default:
        throw new Error('Not implemented');
    }
  };

  async function addNewProviderItem(context): Promise<boolean> {
    const credentials = context;
    let data;
    switch (context.provider) {
      case StorageProviderType.JSONBIN: {
        if (context.id) {
          data = await addJSONBinCredentials(context);
        } else {
          const id = await createNewJSONBin(context);
          credentials.id = id;
          data = true;
        }
        break;
      }
      case StorageProviderType.GITHUB: {
        data = await addNewGitHubCredentials(credentials);
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
  }

  async function addNewBranch({ branch, provider, startBranch }: { branch: string, provider: StorageProviderType, startBranch: string }): Promise<boolean> {
    let newBranch;
    switch (provider) {
      case StorageProviderType.GITHUB: {
        newBranch = await createGithubBranch({ context: api, branch, startBranch });
        break;
      }
      default:
        throw new Error('Not implemented');
    }

    return newBranch;
  }

  async function fetchBranches({
    provider, secret, id, baseUrl,
  } : { provider: StorageProviderType, secret: string, id: string, baseUrl: string }) {
    const [owner, repo] = id.split('/');
    switch (provider) {
      case StorageProviderType.GITHUB:
        return fetchGithubBranches({
          secret, owner, repo, baseUrl,
        });
        break;
      default:
        return null;
        break;
    }
  }

  const deleteProvider = (provider) => {
    postToFigma({
      type: MessageToPluginTypes.REMOVE_SINGLE_CREDENTIAL,
      context: provider,
    });
  };

  return {
    restoreStoredProvider,
    deleteProvider,
    pullTokens,
    pushTokens,
    addNewProviderItem,
    addNewBranch,
    fetchBranches,
  };
}

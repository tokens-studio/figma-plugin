import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { LDProps } from 'launchdarkly-react-client-sdk/lib/withLDConsumer';
import { track } from '@/utils/analytics';
import { useJSONbin } from './providers/jsonbin';
import useURL from './providers/url';
import { Dispatch } from '../store';
import useStorage from './useStorage';
import { useGitHub } from './providers/github';
import { useGitLab } from './providers/gitlab';
import { useSupernova } from './providers/supernova';
import { useBitbucket } from './providers/bitbucket';
import { useADO } from './providers/ado';
import useFile from '@/app/store/providers/file';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import {
  activeTabSelector, apiSelector, themesListSelector, tokensSelector,
} from '@/selectors';
import { UsedTokenSetsMap } from '@/types';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import { useGenericVersionedStorage } from './providers/generic/versionedStorage';
import { RemoteResponseData, RemoteResponseStatus } from '@/types/RemoteResponseData';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { saveLastSyncedState } from '@/utils/saveLastSyncedState';
import { applyTokenSetOrder } from '@/utils/tokenset';
import { isEqual } from '@/utils/isEqual';
import usePullDialog from '../hooks/usePullDialog';
import { Tabs } from '@/constants/Tabs';

type PullTokensOptions = {
  context?: StorageTypeCredentials,
  featureFlags?: LDProps['flags'],
  usedTokenSet?: UsedTokenSetsMap | null
  activeTheme?: Record<string, string>
  collapsedTokenSets?: string[] | null
};

// @TODO typings and hooks

export default function useRemoteTokens() {
  const dispatch = useDispatch<Dispatch>();
  const api = useSelector(apiSelector);
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const activeTab = useSelector(activeTabSelector);
  const { showPullDialog, closePullDialog } = usePullDialog();

  const { setStorageType } = useStorage();
  const { pullTokensFromJSONBin, addJSONBinCredentials, createNewJSONBin } = useJSONbin();
  const { addGenericVersionedCredentials, pullTokensFromGenericVersionedStorage, createNewGenericVersionedStorage } = useGenericVersionedStorage();
  const {
    addNewGitHubCredentials, syncTokensWithGitHub, pullTokensFromGitHub, pushTokensToGitHub, createGithubBranch, fetchGithubBranches, checkRemoteChangeForGitHub,
  } = useGitHub();
  const {
    addNewGitLabCredentials, syncTokensWithGitLab, pullTokensFromGitLab, pushTokensToGitLab, fetchGitLabBranches, createGitLabBranch, checkRemoteChangeForGitLab,
  } = useGitLab();
  const {
    addNewBitbucketCredentials, syncTokensWithBitbucket, pullTokensFromBitbucket, pushTokensToBitbucket, fetchBitbucketBranches, createBitbucketBranch,
  } = useBitbucket();
  const {
    addNewSupernovaCredentials, syncTokensWithSupernova, pushTokensToSupernova, pullTokensFromSupernova,
  } = useSupernova();
  const {
    addNewADOCredentials, syncTokensWithADO, pullTokensFromADO, pushTokensToADO, createADOBranch, fetchADOBranches,
  } = useADO();
  const { pullTokensFromURL } = useURL();
  const { readTokensFromFileOrDirectory } = useFile();

  const pullTokens = useCallback(async ({
    context = api, featureFlags, usedTokenSet, activeTheme, collapsedTokenSets,
  }: PullTokensOptions) => {
    track('pullTokens', { provider: context.provider });
    showPullDialog('loading');
    let remoteData: RemoteResponseData<unknown> | null = null;
    switch (context.provider) {
      case StorageProviderType.JSONBIN: {
        remoteData = await pullTokensFromJSONBin(context);
        break;
      }
      case StorageProviderType.GENERIC_VERSIONED_STORAGE: {
        remoteData = await pullTokensFromGenericVersionedStorage(context);
        break;
      }
      case StorageProviderType.GITHUB: {
        remoteData = await pullTokensFromGitHub(context, featureFlags);
        break;
      }
      case StorageProviderType.BITBUCKET: {
        remoteData = await pullTokensFromBitbucket(context, featureFlags);
        break;
      }
      case StorageProviderType.GITLAB: {
        remoteData = await pullTokensFromGitLab(context, featureFlags);
        break;
      }
      case StorageProviderType.ADO: {
        remoteData = await pullTokensFromADO(context, featureFlags);
        break;
      }
      case StorageProviderType.URL: {
        remoteData = await pullTokensFromURL(context);
        break;
      }
      case StorageProviderType.SUPERNOVA: {
        remoteData = await pullTokensFromSupernova(context);
        break;
      }
      default:
        throw new Error('Not implemented');
    }
    if (remoteData?.status === 'success') {
      if (activeTab === Tabs.LOADING || !isEqual(tokens, remoteData.tokens) || !isEqual(themes, remoteData.themes)) {
        let shouldOverride = false;
        if (activeTab !== Tabs.LOADING) {
          dispatch.tokenState.setChangedState({
            tokens: remoteData.tokens,
            themes: remoteData.themes,
          });
          shouldOverride = !!await showPullDialog();
        }
        if (shouldOverride || activeTab === Tabs.LOADING) {
          switch (context.provider) {
            case StorageProviderType.JSONBIN: {
              break;
            }
            case StorageProviderType.GENERIC_VERSIONED_STORAGE: {
              break;
            }
            case StorageProviderType.GITHUB: {
              dispatch.uiState.setApiData({ ...context, ...(remoteData.commitSha ? { commitSha: remoteData.commitSha } : {}) });
              break;
            }
            case StorageProviderType.BITBUCKET: {
              break;
            }
            case StorageProviderType.GITLAB: {
              dispatch.uiState.setApiData({ ...context, ...(remoteData.commitDate ? { commitDate: remoteData.commitDate } : {}) });
              break;
            }
            case StorageProviderType.ADO: {
              break;
            }
            case StorageProviderType.URL: {
              break;
            }
            default:
              break;
          }
          saveLastSyncedState(dispatch, remoteData.tokens, remoteData.themes, remoteData.metadata);
          dispatch.tokenState.setTokenData({
            values: remoteData.tokens,
            themes: remoteData.themes,
            activeTheme: activeTheme ?? {},
            usedTokenSet: usedTokenSet ?? {},
          });
          dispatch.tokenState.setCollapsedTokenSets(collapsedTokenSets || []);
          track('Launched with token sets', {
            count: Object.keys(remoteData.tokens).length,
            setNames: Object.keys(remoteData.tokens),
          });
        }
      }
    }
    dispatch.tokenState.resetChangedState();
    closePullDialog();
    return remoteData;
  }, [
    tokens,
    themes,
    activeTab,
    dispatch,
    api,
    pullTokensFromGenericVersionedStorage,
    pullTokensFromGitHub,
    pullTokensFromGitLab,
    pullTokensFromBitbucket,
    pullTokensFromJSONBin,
    pullTokensFromURL,
    pullTokensFromADO,
    showPullDialog,
    closePullDialog,
    pullTokensFromSupernova,
  ]);

  const restoreStoredProvider = useCallback(async (context: StorageTypeCredentials) => {
    track('restoreStoredProvider', { provider: context.provider });
    dispatch.uiState.setLocalApiState(context);
    dispatch.uiState.setApiData(context);
    dispatch.tokenState.setEditProhibited(false);
    setStorageType({ provider: context, shouldSetInDocument: true });
    let content: RemoteResponseData | null = null;
    switch (context.provider) {
      case StorageProviderType.GITHUB: {
        content = await syncTokensWithGitHub(context);
        break;
      }
      case StorageProviderType.GITLAB: {
        content = await syncTokensWithGitLab(context);
        break;
      }
      case StorageProviderType.BITBUCKET: {
        content = await syncTokensWithBitbucket(context);
        break;
      }
      case StorageProviderType.ADO: {
        content = await syncTokensWithADO(context);
        break;
      }
      case StorageProviderType.SUPERNOVA: {
        content = await syncTokensWithSupernova(context);
        break;
      }
      default:
        content = await pullTokens({ context });
    }
    if (content?.status === 'failure') {
      return {
        status: 'failure',
        errorMessage: content?.errorMessage,
      };
    }
    if (content) {
      return {
        status: 'success',
      };
    }
    return {
      status: 'failure',
      errorMessage: ErrorMessages.GENERAL_CONNECTION_ERROR,
    };
  }, [
    dispatch,
    setStorageType,
    pullTokens,
    syncTokensWithGitHub,
    syncTokensWithGitLab,
    syncTokensWithBitbucket,
    syncTokensWithADO,
    syncTokensWithSupernova,
  ]);

  const pushTokens = useCallback(async (context: StorageTypeCredentials = api) => {
    track('pushTokens', { provider: context.provider });
    switch (context.provider) {
      case StorageProviderType.GITHUB: {
        await pushTokensToGitHub(context);
        break;
      }
      case StorageProviderType.GITLAB: {
        await pushTokensToGitLab(context);
        break;
      }
      case StorageProviderType.BITBUCKET: {
        await pushTokensToBitbucket(context);
        break;
      }
      case StorageProviderType.ADO: {
        await pushTokensToADO(context);
        break;
      }
      case StorageProviderType.SUPERNOVA: {
        await pushTokensToSupernova(context);
        break;
      }
      default:
        throw new Error('Not implemented');
    }
  }, [
    api,
    pushTokensToGitHub,
    pushTokensToGitLab,
    pushTokensToBitbucket,
    pushTokensToADO,
    pushTokensToSupernova,
  ]);

  const addNewProviderItem = useCallback(async (credentials: StorageTypeFormValues<false>): Promise<RemoteResponseStatus> => {
    let content: RemoteResponseData | null = null;
    switch (credentials.provider) {
      case StorageProviderType.JSONBIN: {
        if (credentials.id) {
          content = await addJSONBinCredentials(credentials);
        } else {
          const id = await createNewJSONBin(credentials);
          if (id) {
            credentials.id = id;
            return {
              status: 'success',
            };
          }
          return {
            status: 'failure',
            errorMessage: ErrorMessages.JSONBIN_CREATE_ERROR,
          };
        }
        break;
      }
      case StorageProviderType.GENERIC_VERSIONED_STORAGE: {
        if (credentials.id) {
          content = await addGenericVersionedCredentials(credentials);
        } else {
          const id = await createNewGenericVersionedStorage(credentials);
          if (id) {
            credentials.id = id;
            return {
              status: 'success',
            };
          }
        }
        break;
      }
      case StorageProviderType.GITHUB: {
        content = await addNewGitHubCredentials(credentials);
        break;
      }
      case StorageProviderType.GITLAB: {
        content = await addNewGitLabCredentials(credentials);
        break;
      }
      case StorageProviderType.BITBUCKET: {
        content = await addNewBitbucketCredentials(credentials);
        break;
      }
      case StorageProviderType.ADO: {
        content = await addNewADOCredentials(credentials);
        break;
      }
      case StorageProviderType.URL: {
        content = await pullTokensFromURL(credentials);
        break;
      }
      case StorageProviderType.SUPERNOVA: {
        content = await addNewSupernovaCredentials(credentials);
        break;
      }
      default:
        throw new Error('Not implemented');
    }
    if (content?.status === 'failure') {
      return {
        status: 'failure',
        errorMessage: content?.errorMessage,
      };
    }
    if (content) {
      dispatch.uiState.setLocalApiState(credentials as StorageTypeCredentials); // in JSONBIN the ID can technically be omitted, but this function handles this by creating a new JSONBin and assigning the ID
      dispatch.uiState.setApiData(credentials as StorageTypeCredentials);
      setStorageType({ provider: credentials as StorageTypeCredentials, shouldSetInDocument: true });
      return {
        status: 'success',
      };
    }
    return {
      status: 'failure',
      errorMessage: ErrorMessages.GENERAL_CONNECTION_ERROR,
    };
  }, [
    dispatch,
    addJSONBinCredentials,
    addGenericVersionedCredentials,
    addNewGitLabCredentials,
    addNewGitHubCredentials,
    addNewBitbucketCredentials,
    addNewADOCredentials,
    addNewSupernovaCredentials,
    createNewJSONBin,
    createNewGenericVersionedStorage,
    pullTokensFromURL,
    setStorageType,
  ]);

  const addNewBranch = useCallback(async (context: StorageTypeCredentials, branch: string, source?: string) => {
    let newBranchCreated = false;
    switch (context.provider) {
      case StorageProviderType.GITHUB: {
        newBranchCreated = await createGithubBranch(context, branch, source);
        break;
      }
      case StorageProviderType.GITLAB: {
        newBranchCreated = await createGitLabBranch(context, branch, source);
        break;
      }
      case StorageProviderType.BITBUCKET: {
        newBranchCreated = await createBitbucketBranch(context, branch, source);
        break;
      }
      case StorageProviderType.ADO: {
        newBranchCreated = await createADOBranch(context, branch, source);
        break;
      }
      default:
        throw new Error('Not implemented');
    }
    return newBranchCreated;
  }, [createGithubBranch, createGitLabBranch, createBitbucketBranch, createADOBranch]);

  const fetchBranches = useCallback(async (context: StorageTypeCredentials) => {
    switch (context.provider) {
      case StorageProviderType.GITHUB:
        return fetchGithubBranches(context);
      case StorageProviderType.GITLAB:
        return fetchGitLabBranches(context);
      case StorageProviderType.BITBUCKET:
        return fetchBitbucketBranches(context);
      case StorageProviderType.ADO:
        return fetchADOBranches(context);
      default:
        return null;
    }
  }, [fetchGithubBranches, fetchGitLabBranches, fetchBitbucketBranches, fetchADOBranches]);

  const deleteProvider = useCallback((provider) => {
    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.REMOVE_SINGLE_CREDENTIAL,
      context: provider,
    });
  }, []);

  const fetchTokensFromFileOrDirectory = useCallback(async ({
    files, usedTokenSet, activeTheme,
  } : { files: FileList | null, usedTokenSet?: UsedTokenSetsMap, activeTheme?: Record<string, string> }) => {
    track('fetchTokensFromFileOrDirectory');
    dispatch.uiState.startJob({ name: BackgroundJobs.UI_FETCHTOKENSFROMFILE });

    if (files) {
      const remoteData = await readTokensFromFileOrDirectory(files);
      if (remoteData?.status === 'success') {
        const sortedTokens = applyTokenSetOrder(remoteData.tokens, remoteData.metadata?.tokenSetOrder ?? Object.keys(remoteData.tokens));
        dispatch.tokenState.setTokenData({
          values: sortedTokens,
          themes: remoteData.themes,
          activeTheme: activeTheme ?? {},
          usedTokenSet: usedTokenSet ?? {},
        });
        track('Launched with token sets', {
          count: Object.keys(remoteData.tokens).length,
          setNames: Object.keys(remoteData.tokens),
        });
      }
      dispatch.uiState.completeJob(BackgroundJobs.UI_FETCHTOKENSFROMFILE);
      return remoteData;
    }
    return null;
  }, [
    dispatch,
    readTokensFromFileOrDirectory,
  ]);

  const checkRemoteChange = useCallback(async (context: StorageTypeCredentials = api): Promise<boolean> => {
    track('checkRemoteChange', { provider: context.provider });
    let hasChange = false;
    switch (context.provider) {
      case StorageProviderType.JSONBIN: {
        hasChange = false;
        break;
      }
      case StorageProviderType.GENERIC_VERSIONED_STORAGE: {
        hasChange = false;
        break;
      }
      case StorageProviderType.GITHUB: {
        hasChange = await checkRemoteChangeForGitHub(context);
        break;
      }
      case StorageProviderType.BITBUCKET: {
        hasChange = false;
        break;
      }
      case StorageProviderType.GITLAB: {
        hasChange = await checkRemoteChangeForGitLab(context);
        break;
      }
      case StorageProviderType.ADO: {
        hasChange = false;
        break;
      }
      case StorageProviderType.URL: {
        hasChange = false;
        break;
      }
      default:
        hasChange = false;
        break;
    }
    return hasChange;
  }, [
    api,
    checkRemoteChangeForGitHub,
    checkRemoteChangeForGitLab,
  ]);

  return useMemo(() => ({
    restoreStoredProvider,
    deleteProvider,
    pullTokens,
    pushTokens,
    addNewProviderItem,
    fetchBranches,
    addNewBranch,
    fetchTokensFromFileOrDirectory,
    checkRemoteChange,
  }), [
    restoreStoredProvider,
    deleteProvider,
    pullTokens,
    pushTokens,
    addNewProviderItem,
    fetchBranches,
    addNewBranch,
    fetchTokensFromFileOrDirectory,
    checkRemoteChange,
  ]);
}

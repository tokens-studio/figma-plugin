import * as Sentry from '@sentry/react';
import type { LDFlagSet } from 'launchdarkly-js-client-sdk';
import { Store } from 'redux';
import { INTERNAL_THEMES_NO_GROUP } from '../../../../constants/InternalTokenGroup';
import type { StartupMessage } from '@/types/AsyncMessages';
import type { Dispatch, RootState } from '@/app/store';
import { Tabs } from '@/constants/Tabs';
import { storageTypeSelector } from '@/selectors';
import { StorageProviderType } from '@/constants/StorageProviderType';
import useConfirm from '@/app/hooks/useConfirm';
import isSameCredentials from '@/utils/isSameCredentials';
import { track } from '@/utils/analytics';
import { hasTokenValues } from '@/utils/hasTokenValues';
import { notifyToUI } from '@/plugin/notifiers';
import type useRemoteTokens from '@/app/store/remoteTokens';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { isGitProvider } from '@/utils/is';

export function pullTokensFactory(
  store: Store<RootState>,
  dispatch: Dispatch,
  flags: LDFlagSet,
  params: StartupMessage,
  useConfirmResult: ReturnType<typeof useConfirm>,
  useRemoteTokensResult: ReturnType<typeof useRemoteTokens>,
) {
  const activeTheme = typeof params.activeTheme === 'string' ? { [INTERNAL_THEMES_NO_GROUP]: params.activeTheme } : params.activeTheme;

  const askUserIfRecoverLocalChanges = async () => {
    const shouldRecoverLocalChanges = await useConfirmResult.confirm({
      text: 'Recover local changes?',
      description: 'You have local changes unsaved to the remote storage.',
    });
    return shouldRecoverLocalChanges;
  };

  const getApiCredentials = async (shouldPull: boolean, isRemoteStorage: boolean) => {
    const state = store.getState();
    const storageType = storageTypeSelector(state);

    if (isRemoteStorage) {
      const matchingSet = params.localApiProviders?.find((provider) => (
        isSameCredentials(provider, storageType)
      ));

      if (matchingSet) {
        // found API credentials
        try {
          const isMultifile = isGitProvider(matchingSet) && 'filePath' in matchingSet && !matchingSet.filePath.endsWith('.json');
          track('Fetched from remote', { provider: matchingSet.provider, isMultifile });
          if (!matchingSet.internalId) {
            track('missingInternalId', { provider: matchingSet.provider });
          }

          if (
            matchingSet.provider === StorageProviderType.GITHUB
            || matchingSet.provider === StorageProviderType.GITLAB
            || matchingSet.provider === StorageProviderType.ADO
            || matchingSet.provider === StorageProviderType.BITBUCKET
          ) {
            const branches = await useRemoteTokensResult.fetchBranches(matchingSet);
            if (branches) dispatch.branchState.setBranches(branches);
          }

          dispatch.uiState.setApiData(matchingSet);
          dispatch.uiState.setLocalApiState(matchingSet);
          // we don't want to update nodes if we're pulling from remote
          dispatch.tokenState.setActiveTheme({ newActiveTheme: activeTheme || null, shouldUpdateNodes: false });
          dispatch.tokenState.setCollapsedTokenSets(params.localTokenData?.collapsedTokenSets || []);

          const remoteData = await useRemoteTokensResult.pullTokens({
            context: matchingSet,
            featureFlags: flags,
            activeTheme,
            usedTokenSet: params.localTokenData?.usedTokenSet,
            collapsedTokenSets: params.localTokenData?.collapsedTokenSets,
            updateLocalTokens: shouldPull,
          });

          if (shouldPull) {
            // If there's no data stored on the remote, show a message - e.g. file doesn't exist.
            if (!remoteData) {
              notifyToUI('Failed to fetch tokens from remote storage', { error: true });
              dispatch.uiState.setActiveTab(Tabs.START);
              return;
            }

            if (remoteData?.status === 'failure') {
              // If we have some error reading tokens, we let the user know - e.g. schema validation doesn't pass.
              notifyToUI(remoteData.errorMessage, { error: true });
              dispatch.uiState.setActiveTab(Tabs.START);
            } else {
              // If we succeeded we can move on to show the tokens screen
              dispatch.uiState.setActiveTab(Tabs.TOKENS);
            }
          } else {
            dispatch.uiState.setActiveTab(Tabs.TOKENS);
          }
        } catch (err) {
          console.error(err);
          Sentry.captureException(err);
          dispatch.uiState.setActiveTab(Tabs.START);
          dispatch.uiState.completeJob(BackgroundJobs.UI_PULLTOKENS);
          notifyToUI('Failed to fetch tokens, check your credentials', { error: true });
        }
      } else {
        // no API credentials available for storage type
        dispatch.uiState.setActiveTab(Tabs.START);
      }
    } else if (params.localTokenData) {
      if (params.localTokenData.tokenFormat) dispatch.tokenState.setTokenFormat(params.localTokenData.tokenFormat);
      dispatch.tokenState.setTokenData({ ...params.localTokenData, activeTheme });
      const existTokens = hasTokenValues(params.localTokenData.values);
      if (existTokens) dispatch.uiState.setActiveTab(Tabs.TOKENS);
      else dispatch.uiState.setActiveTab(Tabs.START);
    }
  };

  return async () => {
    const state = store.getState();
    const storageType = storageTypeSelector(state);
    const isRemoteStorage = [
      StorageProviderType.ADO,
      StorageProviderType.GITHUB,
      StorageProviderType.GITLAB,
      StorageProviderType.BITBUCKET,
      StorageProviderType.JSONBIN,
      StorageProviderType.GENERIC_VERSIONED_STORAGE,
      StorageProviderType.URL,
      StorageProviderType.SUPERNOVA,
      StorageProviderType.TOKENS_STUDIO,
    ].includes(storageType.provider);

    const hasLocalData = params.localTokenData
                         && Object.values(params.localTokenData?.values ?? {}).some((value) => value.length > 0);

    // Check if storage is remote and local data is empty
    if (isRemoteStorage && !hasLocalData) {
      // Pull tokens from remote since local data is empty
      await getApiCredentials(true, isRemoteStorage);
    } else if (params.localTokenData) {
      const checkForChanges = params.localTokenData.checkForChanges ?? false;

      if (
        !checkForChanges
        || (
          isRemoteStorage
          && checkForChanges && (!await askUserIfRecoverLocalChanges())
        )
      ) {
        // get API credentials
        await getApiCredentials(true, isRemoteStorage);
      } else {
        if (params.localTokenData.tokenFormat) dispatch.tokenState.setTokenFormat(params.localTokenData.tokenFormat);
        // User confirmed to recover local changes
        dispatch.tokenState.setTokenData({ ...params.localTokenData, activeTheme });

        if (hasLocalData) {
          // local tokens found
          await getApiCredentials(false, isRemoteStorage);
        } else {
          // no local tokens - go to start
          dispatch.uiState.setActiveTab(Tabs.START);
        }
      }
    } else {
      // no local token values - go to start tab
      dispatch.uiState.setActiveTab(Tabs.START);
    }
  };
}

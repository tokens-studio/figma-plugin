import * as Sentry from '@sentry/react';
import type { LDFlagSet } from 'launchdarkly-js-client-sdk';
import { Store } from 'redux';
import type { StartupMessage } from '@/types/AsyncMessages';
import type { Dispatch, RootState } from '@/app/store';
import { Tabs } from '@/constants/Tabs';
import { storageTypeSelector } from '@/selectors';
import { StorageProviderType } from '@/constants/StorageProviderType';
import useConfirm from '@/app/hooks/useConfirm';
import isSameCredentials from '@/utils/isSameCredentials';
import { track } from '@/utils/analytics';
import { notifyToUI } from '@/plugin/notifiers';
import type useRemoteTokens from '@/app/store/remoteTokens';
import { hasTokenValues } from '@/utils/hasTokenValues';
import { BackgroundJobs } from '@/constants/BackgroundJobs';

export function pullTokensFactory(
  store: Store<RootState>,
  dispatch: Dispatch,
  flags: LDFlagSet,
  params: StartupMessage,
  useConfirmResult: ReturnType<typeof useConfirm>,
  useRemoteTokensResult: ReturnType<typeof useRemoteTokens>,
) {
  const askUserIfRecoverLocalChanges = async () => {
    const shouldRecoverLocalChanges = await useConfirmResult.confirm({
      text: 'Recover local changes?',
      description: 'You have local changes unsaved to the remote storage.',
    });
    return shouldRecoverLocalChanges;
  };

  const getApiCredentials = async (shouldPull: boolean) => {
    const state = store.getState();
    const storageType = storageTypeSelector(state);
    const isRemoteStorage = [
      StorageProviderType.ADO,
      StorageProviderType.GITHUB,
      StorageProviderType.GITLAB,
      StorageProviderType.BITBUCKET,
      StorageProviderType.JSONBIN,
      StorageProviderType.URL,
    ].includes(storageType.provider);

    if (isRemoteStorage) {
      console.log("local", params.localApiProviders, storageType)
      const matchingSet = params.localApiProviders?.find((provider) => (
        isSameCredentials(provider, storageType)
      ));
      console.log('matching', matchingSet)

      if (matchingSet) {
        // found API credentials
        try {
          track('Fetched from remote', { provider: matchingSet.provider });
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
          dispatch.tokenState.setActiveTheme({ themeId: params.activeTheme || null, shouldUpdateNodes: false });

          if (shouldPull) {
            const remoteData = await useRemoteTokensResult.pullTokens({
              context: matchingSet,
              featureFlags: flags,
              activeTheme: params.activeTheme,
              usedTokenSet: params.localTokenData?.usedTokenSet,
            });
            if (remoteData?.status === 'failure') {
              notifyToUI(remoteData.errorMessage, { error: true });
              dispatch.uiState.setActiveTab(Tabs.START);
            } else {
              const existTokens = hasTokenValues(remoteData?.tokens ?? {});
              if (existTokens) {
                dispatch.uiState.setActiveTab(Tabs.TOKENS);
              } else {
                dispatch.uiState.setActiveTab(Tabs.START);
              }
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
      dispatch.tokenState.setTokenData(params.localTokenData);
      const existTokens = hasTokenValues(params.localTokenData.values);
      if (existTokens) dispatch.uiState.setActiveTab(Tabs.TOKENS);
      else dispatch.uiState.setActiveTab(Tabs.START);
    }
  };

  return async () => {
    const state = store.getState();

    if (params.localTokenData) {
      const checkForChanges = params.localTokenData.checkForChanges ?? false;
      const storageType = storageTypeSelector(state);

      if (
        !checkForChanges
        || (
          (storageType && storageType.provider !== StorageProviderType.LOCAL)
          && checkForChanges && (!await askUserIfRecoverLocalChanges())
        )
      ) {
        // get API credentials
        await getApiCredentials(true);
      } else {
        // no local changes and user did not confirm to pull tokens
        dispatch.tokenState.setTokenData(params.localTokenData);
        const hasTokens = Object.values(params.localTokenData?.values ?? {}).some((value) => value.length > 0);
        if (hasTokens) {
          // local tokens found
          await getApiCredentials(false);
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

import type { useFeatureFlags } from '@/app/hooks/useFeatureFlags';
import type { Dispatch } from '@/app/store';
import type useRemoteTokens from '@/app/store/remoteTokens';
import { Tabs } from '@/constants/Tabs';
import { GithubTokenStorage } from '@/storage/GithubTokenStorage';
import { StorageProviderType } from '@/types/api';
import type { ApiCredentialsFromPluginMessage } from '@/types/messages';
import { track } from '@/utils/analytics';

type Options = {
  pullTokens: ReturnType<typeof useRemoteTokens>['pullTokens']
  fetchFeatureFlags: ReturnType<typeof useFeatureFlags>['fetchFeatureFlags']
};

export async function apiCredentials(
  dispatch: Dispatch,
  message: ApiCredentialsFromPluginMessage,
  { pullTokens, fetchFeatureFlags }: Options,
) {
  const {
    status, credentials, featureFlagId, usedTokenSet, activeTheme,
  } = message;
  if (status === true) {
    let receivedFlags;

    if (featureFlagId) {
      receivedFlags = await fetchFeatureFlags(featureFlagId);
      if (receivedFlags) {
        dispatch.uiState.setFeatureFlags(receivedFlags);
        track('FeatureFlag', receivedFlags);
      }
    }

    track('Fetched from remote', { provider: credentials.provider });
    if (!credentials.internalId) track('missingInternalId', { provider: credentials.provider });

    const {
      id, provider, secret, baseUrl,
    } = credentials;
    const [owner, repo] = id.split('/');
    if (provider === StorageProviderType.GITHUB) {
      const storageClient = new GithubTokenStorage(secret, owner, repo, baseUrl);
      const branches = await storageClient.fetchBranches();
      dispatch.branchState.setBranches(branches);
    }

    dispatch.uiState.setApiData(credentials);
    dispatch.uiState.setLocalApiState(credentials);

    const remoteData = await pullTokens({ context: credentials, featureFlags: receivedFlags, usedTokenSet });
    const existTokens = Object.values(remoteData?.tokens ?? {}).some((value) => value.length > 0);
    dispatch.tokenState.setActiveTheme(activeTheme || null);
    if (existTokens) dispatch.uiState.setActiveTab(Tabs.TOKENS);
    else dispatch.uiState.setActiveTab(Tabs.START);
  }
}

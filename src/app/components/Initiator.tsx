import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withLDConsumer } from 'launchdarkly-react-client-sdk';
import type { LDProps } from 'launchdarkly-react-client-sdk/lib/withLDConsumer';
import { identify, track } from '@/utils/analytics';
import { MessageFromPluginTypes, PostToUIMessage } from '@/types/messages';
import useRemoteTokens from '../store/remoteTokens';
import { Dispatch } from '../store';
import useStorage from '../store/useStorage';
import * as pjs from '../../../package.json';
import { Tabs } from '@/constants/Tabs';
import { GithubTokenStorage } from '@/storage/GithubTokenStorage';
import { userIdSelector } from '@/selectors/userIdSelector';
import getLicenseKey from '@/utils/getLicenseKey';
import { licenseKeySelector } from '@/selectors/licenseKeySelector';
import { checkedLocalStorageForKeySelector } from '@/selectors/checkedLocalStorageForKeySelector';
import { AddLicenseSource } from '../store/models/userState';
import { LicenseStatus } from '@/constants/LicenseStatus';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { notifyToUI } from '@/plugin/notifiers';
import { StorageProviderType } from '@/constants/StorageProviderType';

type Props = LDProps & {
  identificationPromise: Promise<LDProps['flags']>
};

function InitiatorContainer({ ldClient, identificationPromise }: Props) {
  const dispatch = useDispatch<Dispatch>();
  const { pullTokens } = useRemoteTokens();
  const { setStorageType } = useStorage();
  const licenseKey = useSelector(licenseKeySelector);
  const checkedLocalStorage = useSelector(checkedLocalStorageForKeySelector);
  const userId = useSelector(userIdSelector);

  const onInitiate = useCallback(() => {
    AsyncMessageChannel.message({ type: AsyncMessageTypes.INITIATE });
  }, []);

  useEffect(() => {
    if (!ldClient) return;

    onInitiate();
    window.onmessage = async (event: {
      data: {
        pluginMessage: PostToUIMessage;
      };
    }) => {
      if (event.data.pluginMessage) {
        const { pluginMessage } = event.data;
        switch (pluginMessage.type) {
          case MessageFromPluginTypes.SELECTION: {
            const { selectionValues, mainNodeSelectionValues, selectedNodes } = pluginMessage;
            dispatch.uiState.setSelectedLayers(selectedNodes);
            dispatch.uiState.setDisabled(false);
            if (mainNodeSelectionValues.length > 1) {
              dispatch.uiState.setMainNodeSelectionValues({});
            } else if (mainNodeSelectionValues.length > 0) {
              // When only one node is selected, we can set the state
              dispatch.uiState.setMainNodeSelectionValues(mainNodeSelectionValues[0]);
            } else {
              // When only one is selected and it doesn't contain any tokens, reset.
              dispatch.uiState.setMainNodeSelectionValues({});
            }

            // Selection values are all tokens across all layers, used in Multi Inspector.
            if (selectionValues) {
              dispatch.uiState.setSelectionValues(selectionValues);
            } else {
              dispatch.uiState.resetSelectionValues();
            }
            break;
          }
          case MessageFromPluginTypes.NO_SELECTION: {
            dispatch.uiState.setDisabled(true);
            dispatch.uiState.setSelectedLayers(0);
            dispatch.uiState.resetSelectionValues();
            dispatch.uiState.setMainNodeSelectionValues({});
            break;
          }
          case MessageFromPluginTypes.REMOTE_COMPONENTS:
            break;
          case MessageFromPluginTypes.TOKEN_VALUES: {
            const { values } = pluginMessage;
            if (values) {
              dispatch.tokenState.setTokenData(values);
              const existTokens = Object.values(values?.values ?? {}).some((value) => value.length > 0);

              if (existTokens) dispatch.uiState.setActiveTab(Tabs.TOKENS);
              else dispatch.uiState.setActiveTab(Tabs.START);
            }
            break;
          }
          case MessageFromPluginTypes.NO_TOKEN_VALUES: {
            dispatch.uiState.setActiveTab(Tabs.START);
            break;
          }
          case MessageFromPluginTypes.STYLES: {
            const { values } = pluginMessage;
            if (values) {
              track('Import styles');
              dispatch.tokenState.setTokensFromStyles(values);
              dispatch.uiState.setActiveTab(Tabs.TOKENS);
            }
            break;
          }
          case MessageFromPluginTypes.RECEIVED_STORAGE_TYPE:
            setStorageType({ provider: pluginMessage.storageType });
            break;
          case MessageFromPluginTypes.API_CREDENTIALS: {
            const {
              status, credentials, usedTokenSet,
            } = pluginMessage;
            if (status === true) {
              try {
                track('Fetched from remote', { provider: credentials.provider });
                if (!credentials.internalId) track('missingInternalId', { provider: credentials.provider });

                // wait of identification
                const receivedFlags = await identificationPromise;

                if (
                  credentials.provider === StorageProviderType.GITHUB
                  || credentials.provider === StorageProviderType.GITLAB
                  || credentials.provider === StorageProviderType.ADO
                ) {
                  const {
                    id, provider, secret, baseUrl,
                  } = credentials;
                  const [owner, repo] = id.split('/');

                  const storageClientFactories = {
                    [StorageProviderType.GITHUB]: GithubTokenStorage,
                    [StorageProviderType.GITLAB]: GithubTokenStorage,
                    [StorageProviderType.ADO]: GithubTokenStorage,
                  };

                  const storageClient = new storageClientFactories[provider](secret, owner, repo, baseUrl);
                  const branches = await storageClient.fetchBranches();
                  dispatch.branchState.setBranches(branches);
                }

                dispatch.uiState.setApiData(credentials);
                dispatch.uiState.setLocalApiState(credentials);

                const remoteData = await pullTokens({ context: credentials, usedTokenSet, featureFlags: receivedFlags });
                const existTokens = Object.values(remoteData?.tokens ?? {}).some((value) => value.length > 0);
                if (existTokens) dispatch.uiState.setActiveTab(Tabs.TOKENS);
                else dispatch.uiState.setActiveTab(Tabs.START);
              } catch (e) {
                console.error(e);
                dispatch.uiState.setActiveTab(Tabs.START);
                notifyToUI('Failed to fetch tokens, check your credentials', { error: true });
              }
            } else {
              dispatch.uiState.setActiveTab(Tabs.START);
            }
            break;
          }
          case MessageFromPluginTypes.API_PROVIDERS: {
            dispatch.uiState.setAPIProviders(pluginMessage.providers);
            break;
          }
          case MessageFromPluginTypes.UI_SETTINGS: {
            dispatch.settings.setUISettings(pluginMessage.settings);
            dispatch.settings.triggerWindowChange();
            break;
          }
          case MessageFromPluginTypes.SHOW_EMPTY_GROUPS: {
            dispatch.uiState.toggleShowEmptyGroups(pluginMessage.showEmptyGroups);
            break;
          }
          case MessageFromPluginTypes.USER_ID: {
            dispatch.userState.setUserId(pluginMessage.user.figmaId);
            dispatch.userState.setUserName(pluginMessage.user.name);
            identify(pluginMessage.user);
            track('Launched', { version: pjs.plugin_version });
            break;
          }
          case MessageFromPluginTypes.RECEIVED_LAST_OPENED: {
            dispatch.uiState.setLastOpened(pluginMessage.lastOpened);
            break;
          }
          case MessageFromPluginTypes.START_JOB: {
            dispatch.uiState.startJob(pluginMessage.job);
            break;
          }
          case MessageFromPluginTypes.COMPLETE_JOB: {
            dispatch.uiState.completeJob(pluginMessage.name);
            break;
          }
          case MessageFromPluginTypes.CLEAR_JOBS: {
            dispatch.uiState.clearJobs();
            break;
          }
          case MessageFromPluginTypes.ADD_JOB_TASKS: {
            dispatch.uiState.addJobTasks({
              name: pluginMessage.name,
              count: pluginMessage.count,
              expectedTimePerTask: pluginMessage.expectedTimePerTask,
            });
            break;
          }
          case MessageFromPluginTypes.COMPLETE_JOB_TASKS: {
            dispatch.uiState.completeJobTasks({
              name: pluginMessage.name,
              count: pluginMessage.count,
              timePerTask: pluginMessage.timePerTask,
            });
            break;
          }
          case MessageFromPluginTypes.LICENSE_KEY: {
            if (pluginMessage.licenseKey) {
              dispatch.userState.addLicenseKey({ key: pluginMessage.licenseKey, source: AddLicenseSource.PLUGIN });
            } else {
              dispatch.userState.setLicenseStatus(LicenseStatus.NO_LICENSE);
              dispatch.userState.setCheckedLocalStorage(true);
            }
            break;
          }
          default:
            break;
        }
      }
    };
  }, [ldClient]);

  useEffect(() => {
    async function getLicense() {
      const { key } = await getLicenseKey(userId);
      if (key) {
        dispatch.userState.addLicenseKey({ key, source: AddLicenseSource.INITAL_LOAD });
      }
    }
    if (userId && checkedLocalStorage && !licenseKey) {
      getLicense();
    }
  }, [userId, dispatch, checkedLocalStorage, licenseKey]);

  return null;
}

export const Initiator = withLDConsumer()(InitiatorContainer);

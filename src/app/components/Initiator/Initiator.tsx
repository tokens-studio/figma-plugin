import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as handlers from './handlers';
import { identify, track } from '@/utils/analytics';
import { MessageFromPluginTypes, PostToUIMessage } from '@/types/messages';
import useRemoteTokens from '../../store/remoteTokens';
import { Dispatch } from '../../store';
import useStorage from '../../store/useStorage';
import * as pjs from '../../../../package.json';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { Tabs } from '@/constants/Tabs';
import { AddLicenseSource } from '@/app/store/models/userState';
import getLicenseKey from '@/utils/getLicenseKey';
import { licenseKeySelector } from '@/selectors/licenseKeySelector';
import { checkedLocalStorageForKeySelector } from '@/selectors/checkedLocalStorageForKeySelector';
import { userIdSelector } from '@/selectors/userIdSelector';

export function Initiator() {
  const dispatch = useDispatch<Dispatch>();

  const { pullTokens } = useRemoteTokens();
  const { fetchFeatureFlags } = useFeatureFlags();
  const { setStorageType } = useStorage();

  const licenseKey = useSelector(licenseKeySelector);
  const checkedLocalStorage = useSelector(checkedLocalStorageForKeySelector);
  const userId = useSelector(userIdSelector);

  React.useEffect(() => {
    AsyncMessageChannel.message({ type: AsyncMessageTypes.INITIATE });

    window.onmessage = async (event: {
      data: {
        pluginMessage: PostToUIMessage
      }
    }) => {
      if (event.data.pluginMessage?.type) {
        const { pluginMessage } = event.data;

        switch (pluginMessage.type) {
          case MessageFromPluginTypes.SELECTION: {
            handlers.selection(dispatch, pluginMessage);
            break;
          }
          case MessageFromPluginTypes.NO_SELECTION: {
            handlers.noSelection(dispatch);
            break;
          }
          case MessageFromPluginTypes.REMOTE_COMPONENTS:
            // @README no-op
            break;
          case MessageFromPluginTypes.TOKEN_VALUES: {
            handlers.tokenValues(dispatch, pluginMessage);
            break;
          }
          case MessageFromPluginTypes.NO_TOKEN_VALUES: {
            dispatch.uiState.setActiveTab(Tabs.START);
            break;
          }
          case MessageFromPluginTypes.STYLES: {
            handlers.styles(dispatch, pluginMessage);
            break;
          }
          case MessageFromPluginTypes.RECEIVED_STORAGE_TYPE:
            // @TODO fix typing
            // @ts-ignore
            setStorageType({ provider: pluginMessage.storageType });
            break;
          case MessageFromPluginTypes.API_CREDENTIALS: {
            await handlers.apiCredentials(dispatch, pluginMessage, { pullTokens, fetchFeatureFlags });
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
              dispatch.userState.setCheckedLocalStorage(true);
            }
            break;
          }
          default:
            break;
        }
      }
    };
  }, []);

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

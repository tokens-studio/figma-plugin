import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { MessageFromPluginTypes, PostToUIMessage } from '@/types/messages';
import useRemoteTokens from '../store/remoteTokens';
import { Dispatch } from '../store';
import useStorage from '../store/useStorage';
import { sortSelectionValueByProperties } from '@/utils/sortSelectionValueByProperties';
import { convertToOrderObj } from '@/utils/convertToOrderObj';
import { Properties } from '@/constants/Properties';
import { Tabs } from '@/constants/Tabs';
import { hasTokenValues } from '@/utils/hasTokenValues';
import { track } from '@/utils/analytics';

// @README this component is not the "Initiator" anymore - as it is named
// but solely acts as the interface between the plugin and the UI

export function Initiator() {
  const dispatch = useDispatch<Dispatch>();
  const { pullTokens, fetchBranches } = useRemoteTokens();
  const { setStorageType } = useStorage();

  useEffect(() => {
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
              const allMainNodeSelectionValues = mainNodeSelectionValues.reduce((acc, crr) => (
                Object.assign(acc, crr)
              ), {});
              const sortedMainNodeSelectionValues = sortSelectionValueByProperties(allMainNodeSelectionValues);
              dispatch.uiState.setMainNodeSelectionValues(sortedMainNodeSelectionValues);
            } else if (mainNodeSelectionValues.length > 0) {
              // When only one node is selected, we can set the state
              const sortedMainNodeSelectionValues = sortSelectionValueByProperties(mainNodeSelectionValues[0]);
              dispatch.uiState.setMainNodeSelectionValues(sortedMainNodeSelectionValues);
            } else {
              // When only one is selected and it doesn't contain any tokens, reset.
              dispatch.uiState.setMainNodeSelectionValues({});
            }

            // Selection values are all tokens across all layers, used in Multi Inspector.
            if (selectionValues) {
              const orderObj = convertToOrderObj(Properties);
              const sortedSelectionValues = selectionValues.sort((a, b) => orderObj[a.type] - orderObj[b.type]);
              dispatch.uiState.setSelectionValues(sortedSelectionValues);
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
          case MessageFromPluginTypes.SET_TOKENS: {
            const { values } = pluginMessage;
            if (values) {
              dispatch.tokenState.setTokenData(values);
              const existTokens = hasTokenValues(values?.values ?? {});
              if (existTokens) dispatch.uiState.setActiveTab(Tabs.TOKENS);
              else dispatch.uiState.setActiveTab(Tabs.START);
            }
            break;
          }
          case MessageFromPluginTypes.NOTIFY_EXCEPTION: {
            Sentry.captureException({ error: pluginMessage.error, ...pluginMessage.opts });
            break;
          }
          case MessageFromPluginTypes.TRACK_FROM_PLUGIN: {
            track(pluginMessage.title, pluginMessage.opts);
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
          case MessageFromPluginTypes.STYLES: {
            const { values } = pluginMessage;
            if (values) {
              track('Import styles');
              dispatch.tokenState.setTokensFromStyles(values);
              dispatch.uiState.setActiveTab(Tabs.TOKENS);
            }
            break;
          }
          case MessageFromPluginTypes.SHOW_EMPTY_GROUPS: {
            dispatch.uiState.toggleShowEmptyGroups(pluginMessage.showEmptyGroups);
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
          default:
            break;
        }
      }
    };
  }, [dispatch, pullTokens, fetchBranches, setStorageType]);

  return null;
}

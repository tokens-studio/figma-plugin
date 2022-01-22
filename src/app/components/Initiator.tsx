import React from 'react';
import { useDispatch } from 'react-redux';
import { MessageFromPluginTypes, MessageToPluginTypes } from '@/types/messages';
import { identify, track } from '@/utils/analytics';
import { postToFigma } from '../../plugin/notifiers';
import useRemoteTokens from '../store/remoteTokens';
import { Dispatch } from '../store';
import useStorage from '../store/useStorage';

export default function Initiator() {
  const dispatch = useDispatch<Dispatch>();

  const { pullTokens } = useRemoteTokens();
  const { setStorageType } = useStorage();

  const onInitiate = () => {
    postToFigma({ type: MessageToPluginTypes.INITIATE });
  };

  React.useEffect(() => {
    onInitiate();
    window.onmessage = async (event) => {
      if (event.data.pluginMessage) {
        const {
          type, values, credentials, status, storageType, lastOpened, providers, user, settings,
        } = event.data.pluginMessage;
        switch (type) {
          case MessageFromPluginTypes.SELECTION: {
            dispatch.uiState.setDisabled(false);
            if (values) {
              dispatch.uiState.setSelectionValues(values);
            } else {
              dispatch.uiState.resetSelectionValues();
            }
            break;
          }
          case MessageFromPluginTypes.NO_SELECTION: {
            dispatch.uiState.setDisabled(true);
            dispatch.uiState.resetSelectionValues();
            break;
          }
          case MessageFromPluginTypes.REMOTE_COMPONENTS:
            dispatch.uiState.setLoading(false);
            break;
          case MessageFromPluginTypes.TOKEN_VALUES: {
            dispatch.uiState.setLoading(false);
            if (values) {
              dispatch.tokenState.setTokenData(values);
              dispatch.uiState.setActiveTab('tokens');
            }
            break;
          }
          case MessageFromPluginTypes.STYLES:
            dispatch.uiState.setLoading(false);
            if (values) {
              track('Import styles');
              dispatch.tokenState.setTokensFromStyles(values);
              dispatch.uiState.setActiveTab('tokens');
            }
            break;
          case MessageFromPluginTypes.RECEIVED_STORAGE_TYPE:
            setStorageType({ provider: storageType });
            break;
          case MessageFromPluginTypes.API_CREDENTIALS: {
            if (status === true) {
              track('Fetched from remote', { provider: credentials.provider });
              if (!credentials.internalId) track('missingInternalId', { provider: credentials.provider });

              dispatch.uiState.setApiData(credentials);
              dispatch.uiState.setLocalApiState(credentials);
              await pullTokens(credentials);
              dispatch.uiState.setActiveTab('tokens');
              dispatch.uiState.setLoading(false);
            }
            break;
          }
          case MessageFromPluginTypes.API_PROVIDERS: {
            dispatch.uiState.setAPIProviders(providers);
            break;
          }
          case MessageFromPluginTypes.UI_SETTINGS: {
            dispatch.settings.setUISettings(settings);
            dispatch.settings.triggerWindowChange();
            break;
          }
          case MessageFromPluginTypes.USER_ID: {
            identify(user);
            track('Launched');
            break;
          }
          case MessageFromPluginTypes.RECEIVED_LAST_OPENED: {
            dispatch.uiState.setLastOpened(lastOpened);
            break;
          }
          default:
            break;
        }
      }
    };
  }, []);

  return null;
}

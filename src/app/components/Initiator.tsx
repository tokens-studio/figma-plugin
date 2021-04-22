import React from 'react';
import {identify, track} from '@/utils/analytics';
import {useDispatch} from 'react-redux';
import {postToFigma} from '../../plugin/notifiers';
import {MessageFromPluginTypes, MessageToPluginTypes} from '../../../types/messages';
import useRemoteTokens from '../store/remoteTokens';
import {useTokenDispatch} from '../store/TokenContext';
import {Dispatch} from '../store';
import useStorage from '../store/useStorage';

export default function Initiator() {
    const dispatch = useDispatch<Dispatch>();

    const {
        setLoading,
        setTokensFromStyles,
        setApiData,
        setLocalApiState,
        setAPIProviders,
        setLastOpened,
    } = useTokenDispatch();
    const {fetchDataFromRemote} = useRemoteTokens();
    const {setStorageType} = useStorage();

    const onInitiate = () => {
        postToFigma({type: MessageToPluginTypes.INITIATE});
    };

    React.useEffect(() => {
        onInitiate();
        window.onmessage = async (event) => {
            if (event.data.pluginMessage) {
                const {
                    type,
                    values,
                    credentials,
                    status,
                    storageType,
                    lastOpened,
                    providers,
                    userId,
                    width,
                    height,
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
                        setLoading(false);
                        break;
                    case MessageFromPluginTypes.TOKEN_VALUES: {
                        setLoading(false);
                        if (values) {
                            dispatch.tokenState.setTokenData(values);
                            dispatch.uiState.setActiveTab('tokens');
                        }
                        break;
                    }
                    case MessageFromPluginTypes.STYLES:
                        setLoading(false);
                        if (values) {
                            track('Import styles');
                            setTokensFromStyles(values);
                            dispatch.uiState.setActiveTab('tokens');
                        }
                        break;
                    case MessageFromPluginTypes.RECEIVED_STORAGE_TYPE:
                        setStorageType({provider: storageType});
                        break;
                    case MessageFromPluginTypes.API_CREDENTIALS: {
                        if (status === true) {
                            const {id, secret, name, provider} = credentials;
                            setApiData({id, secret, name, provider});
                            setLocalApiState({id, secret, name, provider});
                            const remoteValues = await fetchDataFromRemote(id, secret, name, provider);
                            if (remoteValues) {
                                dispatch.tokenState.setTokenData(remoteValues);
                                dispatch.uiState.setActiveTab('tokens');
                            }
                            setLoading(false);
                        }
                        break;
                    }
                    case MessageFromPluginTypes.API_PROVIDERS: {
                        setAPIProviders(providers);
                        break;
                    }
                    case MessageFromPluginTypes.UI_SETTINGS: {
                        dispatch.settings.setWindowSize({width, height});
                        dispatch.settings.triggerWindowChange();
                        break;
                    }
                    case MessageFromPluginTypes.USER_ID: {
                        identify(userId);
                        track('Launched');
                        break;
                    }
                    case MessageFromPluginTypes.RECEIVED_LAST_OPENED: {
                        setLastOpened(lastOpened);
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

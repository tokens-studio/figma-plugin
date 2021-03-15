import React from 'react';
import {identify, track} from '@/utils/analytics';
import {postToFigma} from '../../plugin/notifiers';
import {MessageFromPluginTypes, MessageToPluginTypes} from '../../../types/messages';
import useRemoteTokens from '../store/remoteTokens';
import {useTokenDispatch} from '../store/TokenContext';
import TokenData from './TokenData';

export default function Initiator({setActive, setRemoteComponents}) {
    const {
        setTokenData,
        setLoading,
        setDisabled,
        setSelectionValues,
        resetSelectionValues,
        setTokensFromStyles,
        setApiData,
        setLocalApiState,
        setStorageType,
        setAPIProviders,
        setLastOpened,
    } = useTokenDispatch();
    const {fetchDataFromRemote} = useRemoteTokens();

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
                } = event.data.pluginMessage;
                switch (type) {
                    case MessageFromPluginTypes.SELECTION:
                        setDisabled(false);
                        if (values) {
                            setSelectionValues(values);
                        } else {
                            resetSelectionValues();
                        }
                        break;
                    case MessageFromPluginTypes.NO_SELECTION:
                        setDisabled(true);
                        resetSelectionValues();
                        break;
                    case MessageFromPluginTypes.REMOTE_COMPONENTS:
                        setLoading(false);
                        setRemoteComponents(values.remotes);
                        break;
                    case MessageFromPluginTypes.TOKEN_VALUES: {
                        setLoading(false);
                        if (values) {
                            setTokenData(new TokenData(values));
                            setActive('tokens');
                        }
                        break;
                    }
                    case MessageFromPluginTypes.STYLES:
                        setLoading(false);
                        if (values) {
                            setTokensFromStyles(values);
                            setActive('tokens');
                        }
                        break;
                    case MessageFromPluginTypes.RECEIVED_STORAGE_TYPE:
                        setStorageType(storageType);
                        break;
                    case MessageFromPluginTypes.API_CREDENTIALS: {
                        if (status === true) {
                            const {id, secret, name, provider} = credentials;
                            setApiData({id, secret, name, provider});
                            setLocalApiState({id, secret, name, provider});
                            const remoteValues = await fetchDataFromRemote(id, secret, name, provider);
                            if (remoteValues) {
                                setTokenData(new TokenData(remoteValues));
                                setActive('tokens');
                            }
                            setLoading(false);
                        }
                        break;
                    }
                    case MessageFromPluginTypes.API_PROVIDERS: {
                        setAPIProviders(providers);
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

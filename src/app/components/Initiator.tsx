import React from 'react';
import {postToFigma} from '../../plugin/notifiers';
import {MessageFromPluginTypes, MessageToPluginTypes} from '../../types/messages';
import {fetchDataFromRemote} from '../store/remoteTokens';
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
    } = useTokenDispatch();

    const onInitiate = () => {
        postToFigma({type: MessageToPluginTypes.INITIATE});
    };

    React.useEffect(() => {
        onInitiate();
        window.onmessage = async (event) => {
            if (event.data.pluginMessage) {
                console.log('got a message!', event.data.pluginMessage);

                const {type, values, credentials, status, storageType, providers} = event.data.pluginMessage;
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
                        console.log('got api credentials!', credentials);
                        if (status === false) {
                            console.log('falsy api credentials');
                        } else {
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
                    default:
                        break;
                }
            }
        };
    }, []);

    return null;
}

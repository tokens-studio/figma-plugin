import React from 'react';
import {postToFigma} from '../../plugin/notifiers';
import {MessageFromPluginTypes, MessageToPluginTypes} from '../../types/messages';
import {fetchDataFromRemote} from '../store/remoteTokens';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';
import TokenData from './TokenData';

export default function Initiator({setActive, setRemoteComponents}) {
    const {tokenData} = useTokenState();
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
        console.log('Initiating');
        postToFigma({type: MessageToPluginTypes.INITIATE});
    };

    React.useEffect(() => {
        console.log('effect triggered');
        onInitiate();
        window.onmessage = async (event) => {
            if (event.data.pluginMessage) {
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
                        console.log('got storage type', storageType);
                        break;
                    case MessageFromPluginTypes.API_CREDENTIALS: {
                        if (status === false) {
                            console.log('falsy api credentials');
                        } else {
                            const {id, secret, name, provider} = credentials;
                            console.log('got credentials', credentials);
                            setApiData({id, secret, name, provider});
                            setLocalApiState({id, secret, name, provider});
                            // setTokenData(new TokenData(values));
                            const remoteValues = await fetchDataFromRemote(id, secret, name, provider);
                            if (remoteValues) {
                                console.log('got remote values', remoteValues);
                                console.log('setting updated at');
                                setTokenData(new TokenData(remoteValues));
                                setActive('tokens');
                            }
                            setLoading(false);
                        }
                        break;
                    }
                    case MessageFromPluginTypes.API_PROVIDERS: {
                        console.log('got api providers', providers);

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

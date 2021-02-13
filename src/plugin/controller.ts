/* eslint-disable no-param-reassign */
import {pullStyles, updateStyles} from './styles';
import store from './store';
import {
    notifyNoSelection,
    notifyTokenValues,
    notifyRemoteComponents,
    notifyStorageType,
    notifyAPIProviders,
    notifyUI,
} from './notifiers';
import {findAllWithData, removePluginData, sendPluginValues, updatePluginData} from './pluginData';
import {getTokenData, updateNodes, setTokenData, goToNode, saveStorageType, getSavedStorageType} from './node';
import {removeSingleCredential, updateCredentials} from './helpers';
import {MessageFromPluginTypes, MessageToPluginTypes} from '../types/messages';

figma.showUI(__html__, {
    width: 400,
    height: 600,
});

figma.on('selectionchange', () => {
    const nodes = figma.currentPage.selection;
    if (!nodes.length) {
        notifyNoSelection();
        return;
    }
    sendPluginValues(nodes);
});

const compareProvidersWithStored = (providers, storageType) => {
    if (providers) {
        const parsedProviders = JSON.parse(providers);
        const matchingSet = parsedProviders.find((i) => i.provider === storageType.provider && i.id === storageType.id);

        if (matchingSet) {
            //    send a message to the UI with the credentials stored in the client
            figma.ui.postMessage({
                type: MessageFromPluginTypes.API_CREDENTIALS,
                status: true,
                credentials: matchingSet,
            });
        } else {
            console.log('got no matching set');
        }
    } else {
        //    send a message to the UI that says there are no credentials stored in the client
        figma.ui.postMessage({
            type: MessageFromPluginTypes.API_CREDENTIALS,
            status: false,
        });
        //   Read no values from storage
        notifyTokenValues();
    }
};

figma.ui.onmessage = async (msg) => {
    switch (msg.type) {
        case MessageToPluginTypes.INITIATE:
            try {
                const apiProviders = await figma.clientStorage.getAsync('apiProviders');
                const storageType = await getSavedStorageType();

                notifyStorageType(storageType);
                if (apiProviders) notifyAPIProviders(JSON.parse(apiProviders));

                switch (storageType.provider) {
                    //   Somehow setting this to an ENUM doesn't work :-|
                    case 'jsonbin': {
                        compareProvidersWithStored(apiProviders, storageType);

                        break;
                    }
                    default: {
                        const oldTokens = getTokenData();
                        if (oldTokens) {
                            notifyTokenValues(oldTokens);
                        } else {
                            console.log('no tokens, maybe set empty?');
                        }
                    }
                }
            } catch (err) {
                figma.closePlugin('There was an error.');
                return;
            }

            if (!figma.currentPage.selection.length) {
                notifyNoSelection();
                return;
            }
            sendPluginValues(figma.currentPage.selection);
            return;
        case MessageToPluginTypes.CREDENTIALS: {
            const {secret, id, provider, name} = msg;
            updateCredentials({secret, id, name, provider});
            break;
        }
        case MessageToPluginTypes.REMOVE_SINGLE_CREDENTIAL: {
            const {secret, id} = msg;
            removeSingleCredential({secret, id});
            break;
        }
        case MessageToPluginTypes.SET_STORAGE_TYPE:
            saveStorageType(msg.storageType);
            break;
        case MessageToPluginTypes.SET_NODE_DATA:
            try {
                updatePluginData(figma.currentPage.selection, msg.values);
                sendPluginValues(figma.currentPage.selection, updateNodes(figma.currentPage.selection, msg.tokens));
            } catch (e) {
                console.error(e);
            }
            notifyRemoteComponents({nodes: store.successfulNodes.length, remotes: store.remoteComponents});
            return;

        case MessageToPluginTypes.REMOVE_NODE_DATA:
            try {
                removePluginData(figma.currentPage.selection);
                sendPluginValues(figma.currentPage.selection);
            } catch (e) {
                console.error(e);
            }
            notifyRemoteComponents({nodes: store.successfulNodes.length, remotes: store.remoteComponents});
            return;
        case MessageToPluginTypes.CREATE_STYLES:
            try {
                updateStyles(msg.tokens, true);
            } catch (e) {
                console.error(e);
            }
            return;
        case MessageToPluginTypes.UPDATE: {
            const allWithData = findAllWithData({pageOnly: msg.updatePageOnly});
            setTokenData(msg.tokenValues, msg.updatedAt);
            updateStyles(msg.tokens, false);
            updateNodes(allWithData, msg.tokens);
            updatePluginData(allWithData, {});
            notifyRemoteComponents({nodes: store.successfulNodes.length, remotes: store.remoteComponents});
            return;
        }
        case MessageToPluginTypes.GO_TO_NODE:
            goToNode(msg.id);
            break;
        case MessageToPluginTypes.PULL_STYLES:
            pullStyles(msg.styleTypes);
            break;
        case MessageToPluginTypes.NOTIFY:
            notifyUI(msg.msg, msg.opts);
            break;
        default:
    }
};

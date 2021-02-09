/* eslint-disable no-param-reassign */
import {pullStyles, updateStyles} from './styles';
import store from './store';
import {notifyNoSelection, notifyTokenValues, notifyRemoteComponents} from './notifiers';
import {findAllWithData, removePluginData, sendPluginValues, updatePluginData} from './pluginData';
import {getTokenData, updateNodes, setTokenData, goToNode} from './node';
import {updateCredentials} from './helpers';

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

figma.ui.onmessage = async (msg) => {
    switch (msg.type) {
        case 'initiate':
            try {
                const apiID = await figma.clientStorage.getAsync('apiID');
                const apiSecret = await figma.clientStorage.getAsync('apiSecret');
                const apiProvider = await figma.clientStorage.getAsync('apiProvider');

                if (apiID && apiSecret) {
                    console.log('Got values from storage');
                    // send a message to the UI with the credentials stored in the client
                    figma.ui.postMessage({
                        type: 'apiCredentials',
                        status: true,
                        id: apiID,
                        secret: apiSecret,
                        provider: apiProvider,
                    });
                } else {
                    console.log('NO values from storage');

                    // send a message to the UI that says there are no credentials storred in the client
                    figma.ui.postMessage({
                        type: 'apiCredentials',
                        status: false,
                    });
                    notifyTokenValues(getTokenData());
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
        case 'credentials':
            console.log('initialized credentials', msg.secret, msg.id, msg.provider);
            updateCredentials(msg.secret, msg.id, msg.provider);
            figma.notify(msg.msg, {timeout: 1000});
            break;
        case 'set-node-data':
            try {
                updatePluginData(figma.currentPage.selection, msg.values);
                sendPluginValues(figma.currentPage.selection, updateNodes(figma.currentPage.selection, msg.tokens));
            } catch (e) {
                console.error(e);
            }
            notifyRemoteComponents({nodes: store.successfulNodes.length, remotes: store.remoteComponents});
            return;

        case 'remove-node-data':
            try {
                removePluginData(figma.currentPage.selection);
                sendPluginValues(figma.currentPage.selection);
            } catch (e) {
                console.error(e);
            }
            notifyRemoteComponents({nodes: store.successfulNodes.length, remotes: store.remoteComponents});
            return;
        case 'create-styles':
            try {
                updateStyles(msg.tokens, true);
            } catch (e) {
                console.error(e);
            }
            return;
        case 'update': {
            const allWithData = findAllWithData({pageOnly: msg.updatePageOnly});
            setTokenData(msg.tokenValues);
            updateStyles(msg.tokens, false);
            updateNodes(allWithData, msg.tokens);
            updatePluginData(allWithData, {});
            notifyRemoteComponents({nodes: store.successfulNodes.length, remotes: store.remoteComponents});
            return;
        }
        case 'gotonode':
            goToNode(msg.id);
            break;
        case 'pull-styles':
            pullStyles(msg.styleTypes);
            break;

        default:
    }
};

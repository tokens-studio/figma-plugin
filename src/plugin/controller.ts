/* eslint-disable no-param-reassign */
import {pullStyles, updateStyles} from './styles';
import store from './store';
import {notifyNoSelection, notifyTokenValues, notifyRemoteComponents} from './notifiers';
import {findAllWithData, removePluginData, sendPluginValues, updatePluginData} from './pluginData';
import {getTokenData, updateNodes, setTokenData, goToNode} from './node';

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
            notifyTokenValues(getTokenData());

            if (!figma.currentPage.selection.length) {
                notifyNoSelection();
                return;
            }
            sendPluginValues(figma.currentPage.selection);
            return;
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
                removePluginData(figma.currentPage.selection, msg.key);
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

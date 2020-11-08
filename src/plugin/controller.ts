/* eslint-disable no-param-reassign */
import {pullStyles, updateStyles} from './styles';
import store from './store';
import {
    notifyNoSelection,
    sendPluginValues,
    notifyTokenValues,
    updatePluginData,
    notifyRemoteComponents,
    fetchAllPluginData,
    removePluginData,
} from './notifiers';
import {setValuesOnNode} from './node';

const objectPath = require('object-path');

figma.showUI(__html__, {
    width: 400,
    height: 600,
});

const mapValuesToTokens = (object, values) => {
    const array = Object.entries(values).map(([key, value]) => ({[key]: objectPath.get(object, value)}));
    array.map((item) => ({[item.key]: item.value}));
    return Object.assign({}, ...array);
};

const updateNodes = (nodes, tokens) => {
    const returnedValues = nodes.map((node) => {
        const data = fetchAllPluginData(node);
        if (data) {
            const mappedValues = mapValuesToTokens(tokens, data);
            setValuesOnNode(node, mappedValues, data);
            store.successfulNodes.push(node);
            return data;
        }
    });

    return returnedValues[0];
};

const setTokenData = (data) => {
    figma.root.setSharedPluginData('tokens', 'version', '0.5');
    figma.root.setSharedPluginData('tokens', 'values', JSON.stringify(data));
};

const getTokenData = () => {
    const value = figma.root.getSharedPluginData('tokens', 'values');
    const version = figma.root.getSharedPluginData('tokens', 'version');
    if (value) {
        const parsedValues = JSON.parse(value);
        return {values: parsedValues, version};
    }
};

const goToNode = (id) => {
    const node = figma.getNodeById(id);
    if (node?.type === 'INSTANCE') {
        figma.currentPage.selection = [node];
        figma.viewport.scrollAndZoomIntoView([node]);
    }
};

figma.on('selectionchange', () => {
    const nodes = figma.currentPage.selection;
    if (!nodes.length) {
        notifyNoSelection();
        return;
    }
    sendPluginValues(nodes);
});

const findAllWithData = () => {
    const nodes = figma.root.findAll((node): any => {
        const pluginValues = fetchAllPluginData(node);
        if (pluginValues) return node;
    });
    return nodes;
};

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
        case 'update':
            setTokenData(msg.tokenValues);
            updateStyles(msg.tokens, false);
            updateNodes(findAllWithData(), msg.tokens);
            updatePluginData(findAllWithData(), {});
            notifyRemoteComponents({nodes: store.successfulNodes.length, remotes: store.remoteComponents});
            return;
        case 'gotonode':
            goToNode(msg.id);
            break;
        case 'pull-styles':
            pullStyles(msg.styleTypes);
            break;

        default:
    }
};

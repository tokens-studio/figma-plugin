/* eslint-disable no-param-reassign */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import {removeSingleCredential, updateCredentials} from '@/utils/credentials';
import {updateUISettings, getUISettings} from '@/utils/uiSettings';
import getLastOpened from '@/utils/getLastOpened';
import {getUserId} from './helpers';
import pullStyles from './pullStyles';
import updateStyles from './updateStyles';
import store from './store';
import {
    notifyNoSelection,
    notifyTokenValues,
    notifyRemoteComponents,
    notifyStorageType,
    notifyAPIProviders,
    notifyUI,
    notifyUserId,
    notifyLastOpened,
} from './notifiers';
import {removePluginData, sendPluginValues, updatePluginData} from './pluginData';
import {getTokenData, updateNodes, setTokensOnDocument, goToNode, saveStorageType, getSavedStorageType} from './node';

import {MessageToPluginTypes, PostToFigmaMessage} from '../types/messages';
import {StorageProviderType} from '../types/api';
import compareProvidersWithStored from './compareProviders';
import {defaultNodeManager} from './NodeManager';
import {DefaultWindowSize} from '@/constants/DefaultWindowSize';

figma.showUI(__html__, {
    width: DefaultWindowSize.width,
    height: DefaultWindowSize.height,
});

defaultNodeManager.update().then(() => {
    defaultNodeManager.startUpdateInterval();
});

figma.on('selectionchange', () => {
    const nodes = Array.from(figma.currentPage.selection);
    if (!nodes.length) {
        notifyNoSelection();
        return;
    }
    sendPluginValues(nodes);
});

figma.ui.on('message', async (msg: PostToFigmaMessage) => {
    console.log('plugin', msg);
    switch (msg.type) {
        case MessageToPluginTypes.INITIATE:
            try {
                getUISettings();
                const userId = await getUserId();
                const lastOpened = await getLastOpened();
                const storageType = getSavedStorageType();
                notifyUserId(userId);
                notifyLastOpened(lastOpened);
                notifyStorageType(storageType);

                const apiProviders = await figma.clientStorage.getAsync('apiProviders');
                if (apiProviders) notifyAPIProviders(JSON.parse(apiProviders));
                switch (storageType.provider) {
                    case StorageProviderType.JSONBIN:
                    case StorageProviderType.GITHUB:
                    case StorageProviderType.URL: {
                        compareProvidersWithStored(apiProviders, storageType);
                        break;
                    }
                    default: {
                        const oldTokens = getTokenData();
                        notifyTokenValues(oldTokens);
                    }
                }
            } catch (err) {
                figma.closePlugin('There was an error, check console (F12)');
                console.error(err);
                return;
            }

            if (!figma.currentPage.selection.length) {
                notifyNoSelection();
                return;
            }
            sendPluginValues(figma.currentPage.selection);
            return;
        case MessageToPluginTypes.CREDENTIALS: {
            const {type, ...context} = msg;
            updateCredentials(context);
            break;
        }
        case MessageToPluginTypes.REMOVE_SINGLE_CREDENTIAL: {
            const {context} = msg;
            removeSingleCredential(context);
            break;
        }
        case MessageToPluginTypes.SET_STORAGE_TYPE:
            saveStorageType(msg.storageType);
            break;
        case MessageToPluginTypes.SET_NODE_DATA:
            try {
                if (figma.currentPage.selection.length) {
                    updatePluginData(figma.currentPage.selection, msg.values);
                    sendPluginValues(
                        figma.currentPage.selection,
                        await updateNodes(figma.currentPage.selection, msg.tokens, msg.settings)
                    );
                }
            } catch (e) {
                console.error(e);
            }
            notifyRemoteComponents({
                nodes: store.successfulNodes.length,
                remotes: store.remoteComponents,
            });
            return;

        case MessageToPluginTypes.REMOVE_NODE_DATA:
            try {
                removePluginData(figma.currentPage.selection, msg.key);
                sendPluginValues(figma.currentPage.selection);
            } catch (e) {
                console.error(e);
            }
            notifyRemoteComponents({
                nodes: store.successfulNodes.length,
                remotes: store.remoteComponents,
            });
            return;
        case MessageToPluginTypes.CREATE_STYLES:
            try {
                updateStyles(msg.tokens, true, msg.settings);
            } catch (e) {
                console.error(e);
            }
            return;
        case MessageToPluginTypes.UPDATE: {
            if (msg.settings.updateStyles && msg.tokens) updateStyles(msg.tokens, false, msg.settings);
            if (msg.tokenValues && msg.updatedAt) setTokensOnDocument(msg.tokenValues, msg.updatedAt);
            if (msg.tokens) {
                const allWithData = await defaultNodeManager.findNodesWithData({
                    updateMode: msg.settings.updateMode,
                });
                const nodes = allWithData.map(({node}) => node);
                await updateNodes(nodes, msg.tokens, msg.settings);
                updatePluginData(nodes, {});
                notifyRemoteComponents({
                    nodes: store.successfulNodes.length,
                    remotes: store.remoteComponents,
                });
            }
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
        case MessageToPluginTypes.RESIZE_WINDOW:
            figma.ui.resize(msg.width, msg.height);
            break;
        case MessageToPluginTypes.SET_UI: {
            const width = msg.uiWindow?.width ?? DefaultWindowSize.width;
            const height = msg.uiWindow?.height ?? DefaultWindowSize.height;
            updateUISettings({
                width,
                height,
                updateMode: msg.updateMode,
                updateRemote: msg.updateRemote,
                updateOnChange: msg.updateOnChange,
                updateStyles: msg.updateStyles,
                ignoreFirstPartForStyles: msg.ignoreFirstPartForStyles,
            });
            figma.ui.resize(width, height);
            break;
        }
        default:
    }
});

figma.on('close', () => {
    defaultNodeManager.stopUpdateInterval();
});

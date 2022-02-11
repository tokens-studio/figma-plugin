/* eslint-disable no-param-reassign */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { removeSingleCredential, updateCredentials } from '@/utils/credentials';
import { updateUISettings, getUISettings } from '@/utils/uiSettings';
import getLastOpened from '@/utils/getLastOpened';
import { DefaultWindowSize } from '@/constants/DefaultWindowSize';
import { createAnnotation } from '@/utils/annotations';
import { tokenArrayGroupToMap } from '@/utils/tokenArrayGroupToMap';
import { UpdateMode } from '@/types/state';
import { getUserId } from './helpers';
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
  postToUI,
} from './notifiers';
import {
  removePluginData, sendPluginValues, updatePluginData, findNodesById,
} from './pluginData';
import {
  getTokenData, updateNodes, setTokensOnDocument, goToNode, saveStorageType, getSavedStorageType,
} from './node';

import { MessageFromPluginTypes, MessageToPluginTypes, PostToFigmaMessage } from '../types/messages';
import { StorageProviderType } from '../types/api';
import compareProvidersWithStored from './compareProviders';
import { defaultNodeManager } from './NodeManager';
import { defaultWorker } from './Worker';
import { SelectionValue } from '@/types/tokens';

let inspectDeep = false;

figma.skipInvisibleInstanceChildren = true;

figma.showUI(__html__, {
  width: DefaultWindowSize.width,
  height: DefaultWindowSize.height,
});

figma.on('close', () => {
  defaultWorker.stop();
});

async function sendSelectionChange(): Promise<SelectionValue> {
  const nodes = inspectDeep ? (await defaultNodeManager.findNodesWithData({ updateMode: UpdateMode.SELECTION })).map((node) => node.node) : Array.from(figma.currentPage.selection);
  const currentSelectionLength = figma.currentPage.selection.length;

  if (!currentSelectionLength) {
    notifyNoSelection();
    return [];
  }
  return sendPluginValues(nodes);
}

figma.on('selectionchange', () => {
  sendSelectionChange();
});

figma.ui.on('message', async (msg: PostToFigmaMessage) => {
  switch (msg.type) {
    case MessageToPluginTypes.INITIATE:
      try {
        const { currentUser } = figma;
        const settings = await getUISettings();
        inspectDeep = settings.inspectDeep;
        const userId = await getUserId();
        const lastOpened = await getLastOpened();
        const storageType = getSavedStorageType();
        if (currentUser) {
          notifyUserId({
            userId,
            figmaId: currentUser.id,
            name: currentUser.name,
          });
        }
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
      await sendSelectionChange();
      return;
    case MessageToPluginTypes.CREDENTIALS: {
      const { type, ...context } = msg;
      await updateCredentials(context);
      break;
    }
    case MessageToPluginTypes.REMOVE_SINGLE_CREDENTIAL: {
      const { context } = msg;
      await removeSingleCredential(context);
      break;
    }
    case MessageToPluginTypes.SET_STORAGE_TYPE:
      saveStorageType(msg.storageType);
      break;
    case MessageToPluginTypes.SET_NODE_DATA:
      try {
        if (figma.currentPage.selection.length) {
          const tokensMap = tokenArrayGroupToMap(msg.tokens);

          const nodes = await defaultNodeManager.update(figma.currentPage.selection);
          await updatePluginData(nodes, msg.values);
          await sendPluginValues(
            figma.currentPage.selection,
            await updateNodes(nodes, tokensMap, msg.settings),
          );
        }
      } catch (e) {
        console.error(e);
      }
      notifyRemoteComponents({
        nodes: store.successfulNodes.size,
        remotes: store.remoteComponents,
      });
      return;

    case MessageToPluginTypes.REMOVE_TOKENS_BY_VALUE: {
      msg.tokensToRemove.forEach((token) => {
        const nodes = findNodesById(figma.currentPage.selection, token.nodes);

        removePluginData({ nodes, key: token.property, shouldRemoveValues: false });
      });
      sendSelectionChange();
      break;
    }
    case MessageToPluginTypes.CREATE_STYLES:
      try {
        updateStyles(msg.tokens, true, msg.settings);
      } catch (e) {
        console.error(e);
      }
      return;
    case MessageToPluginTypes.UPDATE: {
      if (msg.settings.updateStyles && msg.tokens) {
        updateStyles(msg.tokens, false, msg.settings);
      }
      if (msg.tokenValues && msg.updatedAt) {
        setTokensOnDocument(msg.tokenValues, msg.updatedAt);
      }
      if (msg.tokens) {
        const tokensMap = tokenArrayGroupToMap(msg.tokens);
        const allWithData = await defaultNodeManager.findNodesWithData({
          updateMode: msg.settings.updateMode,
        });
        await updateNodes(allWithData, tokensMap, msg.settings);
        await updatePluginData(allWithData, {});
        notifyRemoteComponents({
          nodes: store.successfulNodes.size,
          remotes: store.remoteComponents,
        });
      }
      return;
    }
    case MessageToPluginTypes.REMAP_TOKENS:
      try {
        const {
          oldName, newName, updateMode, category,
        } = msg;
        const allWithData = await defaultNodeManager.findNodesWithData({
          updateMode,
        });

        // Go through allWithData and update all appearances of oldName to newName
        const updatedNodes = allWithData.reduce((all, node) => {
          const { tokens } = node;
          let shouldBeRemapped = false;
          const updatedTokens = Object.entries(tokens).reduce((acc, [key, val]) => {
            if (typeof category !== 'undefined' && key !== category) {
              acc[key] = val;
              return acc;
            }
            if (val === oldName) {
              acc[key] = newName;
              shouldBeRemapped = true;
            } else {
              acc[key] = val;
            }
            return acc;
          }, {});
          if (shouldBeRemapped) {
            all.push({
              ...node,
              tokens: updatedTokens,
            });
          }
          return all;
        }, []);
        await updatePluginData(updatedNodes, {}, true);

        await sendSelectionChange();
        notifyRemoteComponents({
          nodes: store.successfulNodes.size,
          remotes: store.remoteComponents,
        });
      } catch (e) {
        console.error(e);
      }
      notifyRemoteComponents({
        nodes: store.successfulNodes.size,
        remotes: store.remoteComponents,
      });
      return;
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
    case MessageToPluginTypes.CANCEL_OPERATION:
      defaultWorker.cancel();
      postToUI({
        type: MessageFromPluginTypes.CLEAR_JOBS,
      });
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
        inspectDeep: msg.inspectDeep,
      });
      figma.ui.resize(width, height);
      if (inspectDeep !== msg.inspectDeep) {
        inspectDeep = msg.inspectDeep;
        sendSelectionChange();
      }
      break;
    }
    case MessageToPluginTypes.CREATE_ANNOTATION: {
      createAnnotation(msg.tokens, msg.direction);
      break;
    }
    default:
  }
});

figma.root.setSharedPluginData('tokens', 'nodemanagerCache', '');

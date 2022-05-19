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
  notifyNoTokenValues,
  notifyTokenValues,
  notifyRemoteComponents,
  notifyStorageType,
  notifyAPIProviders,
  notifyUI,
  notifyUserId,
  notifyLastOpened,
  postToUI,
  notifyLicenseKey,
} from './notifiers';
import { sendPluginValues, updatePluginData, SelectionContent } from './pluginData';
import {
  getTokenData,
  updateNodes,
  goToNode,
  saveStorageType,
  getSavedStorageType,
  selectNodes,
} from './node';

import { MessageFromPluginTypes, MessageToPluginTypes, PostToFigmaMessage } from '../types/messages';
import { StorageProviderType } from '../types/api';
import compareProvidersWithStored from './compareProviders';
import { defaultNodeManager } from './NodeManager';
import { defaultWorker } from './Worker';
import { getUsedTokenSet } from '@/utils/getUsedTokenSet';
import { updateLocalTokensData } from '@/utils/figma';

let inspectDeep = false;
let shouldSendSelectionValues = false;

figma.skipInvisibleInstanceChildren = true;

figma.showUI(__html__, {
  themeColors: true,
  width: DefaultWindowSize.width,
  height: DefaultWindowSize.height,
});

figma.on('close', () => {
  defaultWorker.stop();
});

async function sendSelectionChange(): Promise<SelectionContent | null> {
  const nodes = inspectDeep && shouldSendSelectionValues
    ? (await defaultNodeManager.findNodesWithData({ updateMode: UpdateMode.SELECTION })).map((node) => node.node)
    : Array.from(figma.currentPage.selection);
  const currentSelectionLength = figma.currentPage.selection.length;

  if (!currentSelectionLength) {
    notifyNoSelection();
    return null;
  }
  return sendPluginValues({ nodes, shouldSendSelectionValues });
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
        const usedTokenSet = await getUsedTokenSet();
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

        const licenseKey = await figma.clientStorage.getAsync('licenseKey');
        notifyLicenseKey(licenseKey);

        notifyLastOpened(lastOpened);
        notifyStorageType(storageType);

        const apiProviders = await figma.clientStorage.getAsync('apiProviders');
        if (apiProviders) notifyAPIProviders(JSON.parse(apiProviders));
        switch (storageType.provider) {
          case StorageProviderType.JSONBIN:
          case StorageProviderType.GITHUB:
          case StorageProviderType.GITLAB:
          case StorageProviderType.URL: {
            compareProvidersWithStored({
              providers: apiProviders, storageType, usedTokenSet,
            });
            break;
          }
          default: {
            const oldTokens = getTokenData();
            if (oldTokens) {
              notifyTokenValues({ ...oldTokens, usedTokenSet });
            } else {
              notifyNoTokenValues();
            }
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
      return;
    case MessageToPluginTypes.CREDENTIALS: {
      const { type, ...context } = msg;
      await updateCredentials(context);
      break;
    }
    case MessageToPluginTypes.CHANGED_TABS: {
      const { requiresSelectionValues } = msg;
      shouldSendSelectionValues = requiresSelectionValues;
      await sendSelectionChange();
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
          await updatePluginData({ entries: nodes, values: msg.values });
          await sendPluginValues({
            nodes: figma.currentPage.selection,
            values: await updateNodes(nodes, tokensMap, msg.settings),
            shouldSendSelectionValues: false,
          });
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
      const nodesToRemove: { [key: string]: string[] } = {};

      msg.tokensToRemove.forEach((token) => {
        token.nodes.forEach(({ id }) => {
          nodesToRemove[id] = nodesToRemove[id] ? [...nodesToRemove[id], token.property] : [token.property];
        });
      });

      await Promise.all(
        Object.entries(nodesToRemove).map(async (node) => {
          const newEntries = node[1].reduce((acc, curr) => {
            acc[curr] = 'delete';
            return acc;
          }, {});

          const nodeToUpdate = await defaultNodeManager.getNode(node[0]);
          if (nodeToUpdate) {
            await updatePluginData({ entries: [nodeToUpdate], values: newEntries, shouldRemove: false });
          }
        }),
      );
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
        updateLocalTokensData({
          tokens: msg.tokenValues,
          themes: msg.themes,
          activeTheme: msg.activeTheme,
          usedTokenSets: msg.usedTokenSet,
          updatedAt: msg.updatedAt,
        });
      }
      if (msg.tokens) {
        const tokensMap = tokenArrayGroupToMap(msg.tokens);
        const allWithData = await defaultNodeManager.findNodesWithData({
          updateMode: msg.settings.updateMode,
        });
        await updateNodes(allWithData, tokensMap, msg.settings);
        await updatePluginData({ entries: allWithData, values: {} });
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
        await updatePluginData({ entries: updatedNodes, values: {}, shouldOverride: true });

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
    case MessageToPluginTypes.SELECT_NODES:
      selectNodes(msg.ids);
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
    case MessageToPluginTypes.SET_SHOW_EMPTY_GROUPS: {
      updateUISettings({
        showEmptyGroups: msg.showEmptyGroups,
      });
      break;
    }
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
    case MessageToPluginTypes.SET_LICENSE_KEY: {
      await figma.clientStorage.setAsync('licenseKey', msg.licenseKey);
      break;
    }
    default:
  }
});

figma.root.setSharedPluginData('tokens', 'nodemanagerCache', '');

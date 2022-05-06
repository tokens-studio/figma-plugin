/* eslint-disable no-param-reassign */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import * as asyncHandlers from './asyncMessageHandlers';
import { DefaultWindowSize } from '@/constants/DefaultWindowSize';
import { defaultWorker } from './Worker';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { sendSelectionChange } from './sendSelectionChange';

figma.skipInvisibleInstanceChildren = true;

figma.showUI(__html__, {
  width: DefaultWindowSize.width,
  height: DefaultWindowSize.height,
});

figma.on('close', () => {
  defaultWorker.stop();
});

figma.on('selectionchange', () => {
  sendSelectionChange();
});

AsyncMessageChannel.connect();
AsyncMessageChannel.handle(AsyncMessageTypes.INITIATE, asyncHandlers.initiate);
AsyncMessageChannel.handle(AsyncMessageTypes.CREDENTIALS, asyncHandlers.credentials);
AsyncMessageChannel.handle(AsyncMessageTypes.CHANGED_TABS, asyncHandlers.changedTabs);
AsyncMessageChannel.handle(AsyncMessageTypes.REMOVE_SINGLE_CREDENTIAL, asyncHandlers.removeSingleCredential);
AsyncMessageChannel.handle(AsyncMessageTypes.SET_STORAGE_TYPE, asyncHandlers.setStorageType);
AsyncMessageChannel.handle(AsyncMessageTypes.SET_NODE_DATA, asyncHandlers.setNodeData);
AsyncMessageChannel.handle(AsyncMessageTypes.REMOVE_TOKENS_BY_VALUE, asyncHandlers.removeTokensByValue);
AsyncMessageChannel.handle(AsyncMessageTypes.REMAP_TOKENS, asyncHandlers.remapTokens);
AsyncMessageChannel.handle(AsyncMessageTypes.GOTO_NODE, asyncHandlers.gotoNode);
AsyncMessageChannel.handle(AsyncMessageTypes.SELECT_NODES, asyncHandlers.selectNodes);
AsyncMessageChannel.handle(AsyncMessageTypes.PULL_STYLES, asyncHandlers.pullStyles);
AsyncMessageChannel.handle(AsyncMessageTypes.NOTIFY, asyncHandlers.notify);
AsyncMessageChannel.handle(AsyncMessageTypes.RESIZE_WINDOW, asyncHandlers.resizeWindow);
AsyncMessageChannel.handle(AsyncMessageTypes.CANCEL_OPERATION, asyncHandlers.cancelOperation);
AsyncMessageChannel.handle(AsyncMessageTypes.SET_SHOW_EMPTY_GROUPS, asyncHandlers.setShowEmptyGroups);
AsyncMessageChannel.handle(AsyncMessageTypes.SET_UI, asyncHandlers.setUi);
AsyncMessageChannel.handle(AsyncMessageTypes.CREATE_ANNOTATION, asyncHandlers.createAnnotation);
AsyncMessageChannel.handle(AsyncMessageTypes.CREATE_STYLES, asyncHandlers.createStyles);
AsyncMessageChannel.handle(AsyncMessageTypes.UPDATE, asyncHandlers.update);
AsyncMessageChannel.handle(AsyncMessageTypes.SET_LICENSE_KEY, asyncHandlers.setLicenseKey);

figma.root.setSharedPluginData('tokens', 'nodemanagerCache', '');

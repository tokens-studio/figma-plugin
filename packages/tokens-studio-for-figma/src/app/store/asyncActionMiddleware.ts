import { Middleware } from 'redux';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export const asyncActionMiddleware: Middleware = (_store) => (next) => (action) => {
  // Handle async actions that need to be sent to the plugin
  if (action.type === 'asyncAction/bulkRemap') {
    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.BULK_REMAP_TOKENS,
      oldName: action.payload.oldName,
      newName: action.payload.newName,
      updateMode: action.payload.updateMode,
    });
    return next(action);
  }

  if (action.type === 'asyncAction/restoreNodeData') {
    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.RESTORE_NODE_DATA,
      nodeDataToRestore: action.payload.nodeDataToRestore,
    });
    return next(action);
  }

  return next(action);
};

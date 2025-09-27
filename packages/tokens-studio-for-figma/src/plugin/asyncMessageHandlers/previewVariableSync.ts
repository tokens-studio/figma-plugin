import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import previewVariableSync from '../previewVariableSync';

export const previewVariableSyncHandler: AsyncMessageChannelHandlers[AsyncMessageTypes.PREVIEW_VARIABLE_SYNC] = async (msg) => {
  const { tokens, settings, selectedThemes, selectedSets } = msg;
  
  const result = await previewVariableSync({
    tokens,
    settings,
    selectedThemes,
    selectedSets,
  });
  
  return result;
};
import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import applyVariableChanges from '../applyVariableChanges';

export const applyVariableChangesHandler: AsyncMessageChannelHandlers[AsyncMessageTypes.APPLY_VARIABLE_CHANGES] = async (msg) => {
  const {
    changes, tokens, settings, selectedThemes, selectedSets,
  } = msg;

  const result = await applyVariableChanges({
    changes,
    tokens,
    settings,
    selectedThemes,
    selectedSets,
  });

  return result;
};

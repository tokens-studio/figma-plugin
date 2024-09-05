import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export const getLocalStyles: AsyncMessageChannelHandlers[AsyncMessageTypes.GET_LOCAL_STYLES] = async () => {
  try {
    const localStyles = await Promise.all([
      figma.getLocalPaintStylesAsync(),
      figma.getLocalTextStylesAsync(),
      figma.getLocalEffectStylesAsync(),
    ]).then((results) => results.flat());
    return { styles: localStyles };
  } catch (e) {
    return { styles: [] };
  }
};

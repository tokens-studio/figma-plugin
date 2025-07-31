import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export const removeStylesWithoutConnection: AsyncMessageChannelHandlers[AsyncMessageTypes.REMOVE_STYLES_WITHOUT_CONNECTION] = async (msg) => {
  try {
    let count = 0;
    const localStyles = await Promise.all([
      figma.getLocalPaintStylesAsync(),
      figma.getLocalTextStylesAsync(),
      figma.getLocalEffectStylesAsync(),
    ]).then((results) => results.flat());
    localStyles.forEach((style) => {
      if (!msg.usedStyleIds.includes(style.id)) {
        style.remove();
        count += 1;
      }
    });
    return { countOfRemovedStyles: count };
  } catch (e) {
    return { countOfRemovedStyles: 0 };
  }
};

import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export const getFigmaFonts: AsyncMessageChannelHandlers[AsyncMessageTypes.GET_FIGMA_FONTS] = async () => {
  const availableFonts = await figma.listAvailableFontsAsync();
  return {
    fonts: availableFonts,
  };
};

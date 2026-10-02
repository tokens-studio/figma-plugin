import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { listAvailableFonts } from '../listAvailableFonts';

export const getFigmaFonts: AsyncMessageChannelHandlers[AsyncMessageTypes.GET_FIGMA_FONTS] = async () => {
  const availableFonts = await listAvailableFonts();
  return {
    fonts: availableFonts,
  };
};

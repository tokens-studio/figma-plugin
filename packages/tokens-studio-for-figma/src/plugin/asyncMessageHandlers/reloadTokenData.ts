import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { getTokenData } from '../node';
import { getUsedTokenSet } from '@/utils/getUsedTokenSet';

export const reloadTokenData: AsyncMessageChannelHandlers[AsyncMessageTypes.RELOAD_TOKEN_DATA] = async () => {
  const [localTokenData, usedTokenSet] = await Promise.all([
    getTokenData(),
    getUsedTokenSet(),
  ]);

  if (!localTokenData) {
    throw new Error('No token data found');
  }

  // Ensure activeTheme is always a Record
  const activeTheme = typeof localTokenData.activeTheme === 'string'
    ? {} as Record<string, string>
    : localTokenData.activeTheme;

  return {
    values: localTokenData.values,
    themes: localTokenData.themes || [],
    activeTheme,
    usedTokenSet: usedTokenSet || {},
  };
};

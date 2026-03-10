import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { OAuthTokensProperty } from '@/figmaStorage/OAuthTokensProperty';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export const setOAuthTokens: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_OAUTH_TOKENS] = async (msg) => {
  await OAuthTokensProperty.write(msg.oauthTokens);
};

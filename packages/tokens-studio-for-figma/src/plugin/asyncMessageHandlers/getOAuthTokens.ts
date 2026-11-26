import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { OAuthTokensProperty } from '@/figmaStorage/OAuthTokensProperty';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

// Every open file shares these tokens, so a file reads them back before it refreshes:
// another file may already have rotated the refresh token it holds in memory.
export const getOAuthTokens: AsyncMessageChannelHandlers[AsyncMessageTypes.GET_OAUTH_TOKENS] = async () => ({
  oauthTokens: (await OAuthTokensProperty.read()) ?? null,
});

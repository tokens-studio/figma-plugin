import { TokenTypes } from '@/constants/TokenTypes';
import { TokenBoxshadowValue } from '../values';
import { SingleGenericToken } from './SingleGenericToken';
import { TokenInJSON } from '@/utils/convertTokens';

export type SingleBoxShadowToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.BOX_SHADOW, (
  TokenBoxshadowValue | TokenBoxshadowValue[] | string
), Named, P>;

export type SingleBoxShadowTokenInJSON = TokenInJSON<TokenTypes.BOX_SHADOW, TokenBoxshadowValue | TokenBoxshadowValue[] | string>;

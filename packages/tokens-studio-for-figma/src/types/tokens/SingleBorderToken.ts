import { TokenTypes } from '@/constants/TokenTypes';
import { TokenBorderValue } from '../values';
import { SingleGenericToken } from './SingleGenericToken';
import { TokenInJSON } from '@/utils/convertTokens';

export type SingleBorderToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.BORDER, TokenBorderValue, Named, P>;
export type SingleBorderTokenInJSON = TokenInJSON<TokenTypes.BORDER, TokenBorderValue | string>;

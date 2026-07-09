import { TokenTypes } from '@/constants/TokenTypes';
import { TokenGradientValue } from '../values';
import { SingleGenericToken } from './SingleGenericToken';
import { TokenInJSON } from '@/utils/convertTokens';

export type SingleGradientToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.GRADIENT, TokenGradientValue | string, Named, P>;
export type SingleGradientTokenInJSON = TokenInJSON<TokenTypes.GRADIENT, TokenGradientValue | string>;

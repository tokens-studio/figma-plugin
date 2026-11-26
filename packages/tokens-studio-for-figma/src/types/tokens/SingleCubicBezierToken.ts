import { TokenTypes } from '@/constants/TokenTypes';
import { TokenCubicBezierValue } from '../values';
import { SingleGenericToken } from './SingleGenericToken';
import { TokenInJSON } from '@/utils/convertTokens';

export type SingleCubicBezierToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.CUBIC_BEZIER, string | TokenCubicBezierValue, Named, P>;
export type SingleCubicBezierTokenInJSON = TokenInJSON<TokenTypes.CUBIC_BEZIER, TokenCubicBezierValue | string>;

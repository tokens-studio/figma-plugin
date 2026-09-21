import { TokenTypes } from '@/constants/TokenTypes';
import { TokenDurationValue } from '../values';
import { SingleGenericToken } from './SingleGenericToken';
import { TokenInJSON } from '@/utils/convertTokens';

export type SingleDurationToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.DURATION, string | TokenDurationValue, Named, P>;
export type SingleDurationTokenInJSON = TokenInJSON<TokenTypes.DURATION, TokenDurationValue | string>;

import { TokenTypes } from '@/constants/TokenTypes';
import { TokenMotionValue } from '../values';
import { SingleGenericToken } from './SingleGenericToken';
import { TokenInJSON } from '@/utils/convertTokens';

export type SingleMotionToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.MOTION, TokenMotionValue, Named, P>;
export type SingleMotionTokenInJSON = TokenInJSON<TokenTypes.MOTION, TokenMotionValue | string>;

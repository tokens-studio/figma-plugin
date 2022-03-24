import { TokenTypes } from '@/constants/TokenTypes';
import { TokenBoxshadowValue } from '../values';
import { SingleGenericToken } from './SingleGenericToken';
export declare type SingleBoxShadowToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.BOX_SHADOW, (TokenBoxshadowValue | TokenBoxshadowValue[]), Named, P>;

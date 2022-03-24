import { TokenTypes } from '@/constants/TokenTypes';
import { TokenBoxshadowValue } from '../values';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleBoxShadowToken<Named extends boolean = true> = SingleGenericToken<TokenTypes.BOX_SHADOW, (
  TokenBoxshadowValue | TokenBoxshadowValue[]
), Named>;

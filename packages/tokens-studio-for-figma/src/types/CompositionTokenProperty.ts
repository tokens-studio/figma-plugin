import { Properties } from '@/constants/Properties';
import type { TokenTypes } from '@/constants/TokenTypes';
import {
  TokenBoxshadowValue, TokenTypographyValue, TokenBorderValue, TokenMotionValue, TokenDurationValue, TokenCubicBezierValue,
} from './values';

export type CompositionTokenProperty = keyof typeof Properties;

type CompositionValueUnion = string | number | TokenTypographyValue | TokenBoxshadowValue | TokenBorderValue | TokenMotionValue | TokenDurationValue | TokenCubicBezierValue | Array<TokenBoxshadowValue>;

export type CompositionTokenValue = Partial<
Record<TokenTypes, CompositionValueUnion>
& Record<Properties, CompositionValueUnion>
>;

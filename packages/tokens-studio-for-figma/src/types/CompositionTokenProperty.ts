import { Properties } from '@/constants/Properties';
import type { TokenTypes } from '@/constants/TokenTypes';
import { TokenBoxshadowValue, TokenTypographyValue, TokenBorderValue } from './values';

export type CompositionTokenProperty = keyof typeof Properties;

export type CompositionTokenValue = Partial<
Record<TokenTypes, string | number | TokenTypographyValue | TokenBoxshadowValue | TokenBorderValue | Array<TokenBoxshadowValue>>
& Record<Properties, string | number | TokenTypographyValue | TokenBoxshadowValue | TokenBorderValue | Array<TokenBoxshadowValue>>
>;

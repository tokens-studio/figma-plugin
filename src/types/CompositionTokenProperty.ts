import { Properties } from '@/constants/Properties';
import type { TokenTypes } from '@/constants/TokenTypes';
import { TokenBoxshadowValue, TokenTypograpyValue } from './values';

export type CompositionTokenProperty = keyof typeof Properties;

export type CompositionTokenValue = Partial<
Record<TokenTypes, string | number | TokenTypograpyValue | TokenBoxshadowValue | Array<TokenBoxshadowValue>>
& Record<Properties, string | number | TokenTypograpyValue | TokenBoxshadowValue | Array<TokenBoxshadowValue>>
>;

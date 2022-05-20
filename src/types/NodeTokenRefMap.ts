import type { Properties } from '@/constants/Properties';
import type { TokenTypes } from '@/constants/TokenTypes';
import { TokenBoxshadowValue } from './values';

export type NodeTokenRefMap = Partial<
Record<TokenTypes, string | object | Array<TokenBoxshadowValue>>
& Record<Properties, string | object | Array<TokenBoxshadowValue>>
>;

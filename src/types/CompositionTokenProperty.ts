import { Properties } from "@/constants/Properties";
import type { TokenTypes } from '@/constants/TokenTypes';
import { TokenBoxshadowValue } from "./values";

export type CompositionTokenProperty = keyof typeof Properties;

export type CompositionTokenValue = Partial<
Record<TokenTypes, string | number | object | Array<TokenBoxshadowValue>>
& Record<Properties, string | number | object | Array<TokenBoxshadowValue>>
>;

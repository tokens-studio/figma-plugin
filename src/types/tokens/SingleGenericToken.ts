import { TokenTypes } from '@/constants/TokenTypes';
import { ColorModifier } from '../Modifier';

export type SingleGenericToken<T extends TokenTypes, V = string, Named extends boolean = true, P = unknown> = {
  type: T;
  value: V;
  rawValue?: V;
  description?: string;
  oldDescription?: string;
  oldValue?: V;
  internal__Parent?: string;
  inheritTypeLevel?: number;
  $extensions?: { 'studio.tokens': { modify: ColorModifier } }
} & (Named extends true ? {
  name: string;
} : {
  name?: string;
}) & P;

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
  $extensions?: {
    [key: string]: any;
    'studio.tokens'?: {
      [key: string]: any;
      modify?: ColorModifier;
    },
    id: string;
  }
} & (Named extends true ? {
  name: string;
} : {
  name?: string;
}) & P;

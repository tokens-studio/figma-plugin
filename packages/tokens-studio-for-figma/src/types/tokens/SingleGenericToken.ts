import { TokenTypes } from '@/constants/TokenTypes';
import { ColorModifier } from '../Modifier';

export type SingleGenericToken<T extends TokenTypes, V = string, Named extends boolean = true, P = unknown> = {
  type: T;
  value: V;
  rawValue?: V;
  resolvedValueWithReferences?: V;
  description?: string;
  oldDescription?: string;
  oldValue?: V;
  internal__Parent?: string;
  inheritTypeLevel?: number;
  $extensions?: {
    [key: string]: any;
    'studio.tokens'?: {
      [key: string]: any;
      id?: string;
      modify?: ColorModifier;
      urn?: string;
    },
    id?: string;
  }
} & (Named extends true ? {
  name: string;
} : {
  name?: string;
}) & P;

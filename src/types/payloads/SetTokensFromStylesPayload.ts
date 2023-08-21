import { SingleToken } from '../tokens';
import { TokenTypes } from '@/constants/TokenTypes';

export type StyleToCreateToken = {
  name: string
  value: SingleToken['value']
  oldValue?: SingleToken['value']
  type: TokenTypes
  description?: string
  oldDescription?: string
};

export type SetTokensFromStylesPayload = Record<string, StyleToCreateToken[]>;

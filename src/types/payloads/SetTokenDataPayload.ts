import { TokenTypes } from '@/constants/TokenTypes';
import { AnyTokenList, SingleToken } from '../tokens';

export type SetTokenDataPayload = {
  values:
  SingleToken[]
  | Record<string, AnyTokenList>
  | Record<string, Partial<Record<TokenTypes, Record<string, SingleToken<false>>>>>
  shouldUpdate?: boolean;
  usedTokenSet?: string[]
};

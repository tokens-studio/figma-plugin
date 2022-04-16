import { TokenTypes } from '@/constants/TokenTypes';
import { AnyTokenList, SingleToken } from '../tokens';
import { UsedTokenSetsMap } from '../UsedTokenSetsMap';

type ShallowTokenMap = Record<string, SingleToken<false>>;
type DeepTokenMap = Record<string, Record<string, SingleToken<false>>>;
export type SetTokenDataPayload = {
  values:
  SingleToken[]
  | Record<string, AnyTokenList>
  | Record<string, Partial<Record<TokenTypes, ShallowTokenMap | DeepTokenMap>>>
  shouldUpdate?: boolean;
  usedTokenSet?: UsedTokenSetsMap
};

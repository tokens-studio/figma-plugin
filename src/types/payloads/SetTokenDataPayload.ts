import { TokenTypes } from '@/constants/TokenTypes';
import { ThemeObjectsMap } from '../ThemeObjectsMap';
import { AnyTokenList, SingleToken } from '../tokens';
import { UsedTokenSetsMap } from '../UsedTokenSetsMap';

type ShallowTokenMap = Record<string, SingleToken<false>>;
type DeepTokenMap = Record<string, Record<string, SingleToken<false>>>;
export type SetTokenDataPayload = {
  values:
  SingleToken[]
  | Record<string, AnyTokenList>
  | Record<string, Partial<Record<TokenTypes, ShallowTokenMap | DeepTokenMap>>>
  themes: ThemeObjectsMap
  activeTheme: string | null
  shouldUpdate?: boolean;
  usedTokenSet?: UsedTokenSetsMap
};

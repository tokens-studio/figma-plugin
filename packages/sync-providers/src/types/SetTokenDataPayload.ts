import { TokenTypes } from '../constants';
import type { ThemeObjectsList } from './ThemeObjectsList';
import type { AnyTokenList, SingleToken } from './tokens';
import type { UsedTokenSetsMap } from './UsedTokenSetsMap';

type ShallowTokenMap = Record<string, SingleToken<false>>;
type DeepTokenMap = Record<string, Record<string, SingleToken<false>>>;
export type SetTokenDataPayload = {
  values:
  SingleToken[]
  | Record<string, AnyTokenList>
  | Record<string, Partial<Record<TokenTypes, ShallowTokenMap | DeepTokenMap>>>
  themes?: ThemeObjectsList
  activeTheme?: Record<string, string>
  shouldUpdate?: boolean;
  usedTokenSet?: UsedTokenSetsMap | null
  hasChangedRemote?: boolean
};

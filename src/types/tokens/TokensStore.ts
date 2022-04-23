import { UsedTokenSetsMap } from '../UsedTokenSetsMap';
import { AnyTokenList } from './AnyTokenList';

export type TokenStore = {
  version: string;
  updatedAt: string;
  // @README these could be different themes or sets of tokens
  values: Record<string, AnyTokenList>
  usedTokenSet?: UsedTokenSetsMap | null;
  checkForChanges: string;
};

import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import { ThemeObject } from '@/types';
import { AnyTokenList } from '@/types/tokens';
import { defaultTokenResolver } from '@/utils/TokenResolver';
import { mergeTokenGroups } from '@/utils/tokenHelpers';

export function generateTokensToCreate(theme: ThemeObject, tokens: Record<string, AnyTokenList>, availableTokenTypes: TokenTypes[], currentSet?: string) {
  // Big O(resolveTokenValues * mergeTokenGroups)
  const enabledTokenSets = Object.entries(theme.selectedTokenSets)
    .filter(([, status]) => status === TokenSetStatus.ENABLED)
    .map(([tokenSet]) => tokenSet);
  const resolved = defaultTokenResolver.setTokens(mergeTokenGroups(tokens, theme.selectedTokenSets));
  const checkTokenSets = currentSet? [currentSet]: enabledTokenSets;
  return resolved.filter(
    (token) => ((!token.internal__Parent || checkTokenSets.includes(token.internal__Parent)) && availableTokenTypes.includes(token.type)), // filter out SOURCE tokens
  );
}

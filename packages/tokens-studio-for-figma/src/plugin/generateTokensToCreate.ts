import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { tokenTypesToCreateVariable } from '@/constants/VariableTypes';
import { ThemeObject, UsedTokenSetsMap } from '@/types';
import { AnyTokenList } from '@/types/tokens';
import { TokenResolver } from '@/utils/TokenResolver';
import { mergeTokenGroups, ResolveTokenValuesResult } from '@/utils/tokenHelpers';
import { normalizeTokenSetName } from '@/utils/normalizeTokenSetName';

export function generateTokensToCreate({
  theme,
  tokens,
  filterByTokenSet,
  overallConfig = {},
  themeTokenResolver,
}: {
  theme: ThemeObject;
  tokens: Record<string, AnyTokenList>;
  filterByTokenSet?: string;
  overallConfig?: UsedTokenSetsMap;
  themeTokenResolver?: TokenResolver;
}): { tokensToCreate: ResolveTokenValuesResult[]; resolvedTokens: ResolveTokenValuesResult[] } {
  // Big O(resolveTokenValues * mergeTokenGroups)
  const normalizedFilterByTokenSet = filterByTokenSet ? normalizeTokenSetName(filterByTokenSet) : undefined;
  const enabledTokenSets = Object.entries(theme.selectedTokenSets)
    .filter(([name, status]) => status === TokenSetStatus.ENABLED && (!normalizedFilterByTokenSet || normalizeTokenSetName(name) === normalizedFilterByTokenSet))
    .map(([tokenSet]) => normalizeTokenSetName(tokenSet));
  // Create a separate TokenResolver instance for this theme to avoid interference
  // when multiple themes are processed concurrently (if not provided)
  const resolver = themeTokenResolver || new TokenResolver([]);
  const resolved = resolver.setTokens(mergeTokenGroups(tokens, theme.selectedTokenSets, overallConfig));
  const tokensToCreate = resolved.filter(
    (token) => ((!token.internal__Parent || enabledTokenSets.includes(token.internal__Parent)) && tokenTypesToCreateVariable.includes(token.type)), // filter out SOURCE tokens
  );
  return { tokensToCreate, resolvedTokens: resolved };
}

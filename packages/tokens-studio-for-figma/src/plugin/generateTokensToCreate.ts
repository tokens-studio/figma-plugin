import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { tokenTypesToCreateVariable } from '@/constants/VariableTypes';
import { ThemeObject, UsedTokenSetsMap } from '@/types';
import { AnyTokenList } from '@/types/tokens';
import { TokenResolver } from '@/utils/TokenResolver';
import { mergeTokenGroups, ResolveTokenValuesResult } from '@/utils/tokenHelpers';

export function generateTokensToCreate({
  theme,
  tokens,
  filterByTokenSet,
  overallConfig = {},
  themeTokenResolver,
  preResolvedTokens,
}: {
  theme: ThemeObject;
  tokens: Record<string, AnyTokenList>;
  filterByTokenSet?: string;
  overallConfig?: UsedTokenSetsMap;
  themeTokenResolver?: TokenResolver;
  /**
   * Optional pre-resolved tokens from the Studio server (gRPC resolver).
   * When provided, skips local mergeTokenGroups + TokenResolver entirely
   * so resolved values match exactly what the Studio web app shows.
   */
  preResolvedTokens?: ResolveTokenValuesResult[];
}): { tokensToCreate: ResolveTokenValuesResult[]; resolvedTokens: ResolveTokenValuesResult[] } {
  const enabledTokenSets = Object.entries(theme.selectedTokenSets)
    .filter(([name, status]) => status === TokenSetStatus.ENABLED && (!filterByTokenSet || name === filterByTokenSet))
    .map(([tokenSet]) => tokenSet);

  // Use server-resolved tokens when available to guarantee consistency with the Studio app.
  // Otherwise fall back to local resolution.
  const resolved: ResolveTokenValuesResult[] = preResolvedTokens
    ?? (() => {
      const resolver = themeTokenResolver || new TokenResolver([]);
      return resolver.setTokens(mergeTokenGroups(tokens, theme.selectedTokenSets, overallConfig));
    })();

  // Big O(resolveTokenValues * mergeTokenGroups) — only applies for local resolution path
  const tokensToCreate = resolved.filter(
    (token) => ((!token.internal__Parent || enabledTokenSets.includes(token.internal__Parent)) && tokenTypesToCreateVariable.includes(token.type)), // filter out SOURCE tokens
  );
  return { tokensToCreate, resolvedTokens: resolved };
}

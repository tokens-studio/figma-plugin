import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { tokenTypesToCreateVariable } from '@/constants/VariableTypes';
import { ThemeObject, UsedTokenSetsMap } from '@/types';
import { AnyTokenList } from '@/types/tokens';
import { defaultTokenResolver } from '@/utils/TokenResolver';
import { mergeTokenGroups } from '@/utils/tokenHelpers';
import { expandCompositeTokensForVariables } from '@/utils/expandCompositeTokensForVariables';

export function generateTokensToCreate({
  theme,
  tokens,
  filterByTokenSet,
  overallConfig = {},
}: {
  theme: ThemeObject;
  tokens: Record<string, AnyTokenList>;
  filterByTokenSet?: string;
  overallConfig?: UsedTokenSetsMap;
}) {
  // Big O(resolveTokenValues * mergeTokenGroups)
  const enabledTokenSets = Object.entries(theme.selectedTokenSets)
    .filter(([name, status]) => status === TokenSetStatus.ENABLED && (!filterByTokenSet || name === filterByTokenSet))
    .map(([tokenSet]) => tokenSet);
  const resolved = defaultTokenResolver.setTokens(mergeTokenGroups(tokens, theme.selectedTokenSets, overallConfig));

  // Expand composite tokens (typography, border, boxShadow, composition) into individual property tokens
  const expandedTokens = expandCompositeTokensForVariables(resolved);

  return expandedTokens.filter(
    (token) => ((!token.internal__Parent || enabledTokenSets.includes(token.internal__Parent)) && tokenTypesToCreateVariable.includes(token.type)), // filter out SOURCE tokens
  );
}

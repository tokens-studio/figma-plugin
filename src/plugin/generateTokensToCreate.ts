import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import { ThemeObject } from '@/types';
import { AnyTokenList } from '@/types/tokens';
import { mergeTokenGroups, resolveTokenValues } from './tokenHelpers';

export function generateTokensToCreate(theme: ThemeObject, tokens: Record<string, AnyTokenList>) {
  const enabledTokenSets = Object.entries(theme.selectedTokenSets)
    .filter(([, status]) => status === TokenSetStatus.ENABLED)
    .map(([tokenSet]) => tokenSet);
  const resolved = resolveTokenValues(mergeTokenGroups(tokens, theme.selectedTokenSets));
  const withoutIgnoredAndSourceTokens = resolved.filter(
    (token) => !token.name.split('.').some((part) => part.startsWith('_')) // filter out ignored tokens
      && (!token.internal__Parent || enabledTokenSets.includes(token.internal__Parent)), // filter out SOURCE tokens
  );

  const tokensToCreate = withoutIgnoredAndSourceTokens.filter((token) => [token.type === TokenTypes.TYPOGRAPHY, token.type === TokenTypes.COLOR, token.type === TokenTypes.BOX_SHADOW].some(
    (isEnabled) => isEnabled,
  ));
  return tokensToCreate;
}

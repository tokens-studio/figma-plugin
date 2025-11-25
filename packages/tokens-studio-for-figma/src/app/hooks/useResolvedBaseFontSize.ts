import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { TokensContext } from '@/context';
import { aliasBaseFontSizeSelector } from '@/selectors';
import { getAliasValue } from '@/utils/alias';

/**
 * Custom hook that resolves the current base font size for rem conversion.
 * This hook handles the logic of getting the alias base font size from settings,
 * resolving it against the current tokens context, and providing a fallback value.
 *
 * @returns The resolved base font size as a string (e.g., "16px")
 */
export function useResolvedBaseFontSize(): string {
  const tokensContext = useContext(TokensContext);
  const aliasBaseFontSize = useSelector(aliasBaseFontSizeSelector);

  // Get the current resolved base font size for rem conversion
  const currentBaseFontSize = React.useMemo(() => {
    if (aliasBaseFontSize) {
      const resolvedBaseFontSize = getAliasValue(aliasBaseFontSize, tokensContext.resolvedTokens);
      return resolvedBaseFontSize ? String(resolvedBaseFontSize) : '16px';
    }
    return '16px';
  }, [aliasBaseFontSize, tokensContext.resolvedTokens]);

  return currentBaseFontSize;
}

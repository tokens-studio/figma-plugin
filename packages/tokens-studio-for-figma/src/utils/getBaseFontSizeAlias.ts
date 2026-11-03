import { SingleToken } from '@/types/tokens';

// Tokens Studio projects can define their rem base as this token
export const SYSTEM_BASE_FONT_SIZE_TOKEN = '@system.baseFontSize';

/**
 * Returns the alias to resolve the rem base font size from. When the plugin setting is empty,
 * fall back to the project's `@system.baseFontSize` token so rem values match what Studio shows
 * instead of silently using 16px.
 */
export function getBaseFontSizeAlias(aliasBaseFontSize: string | null | undefined, resolvedTokens: SingleToken[] = []): string {
  if (aliasBaseFontSize) return aliasBaseFontSize;
  if (resolvedTokens.some((token) => token.name === SYSTEM_BASE_FONT_SIZE_TOKEN)) {
    return `{${SYSTEM_BASE_FONT_SIZE_TOKEN}}`;
  }
  return aliasBaseFontSize ?? '';
}

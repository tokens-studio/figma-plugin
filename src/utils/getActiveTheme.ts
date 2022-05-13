import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { tokensSharedDataHandler } from '@/plugin/SharedDataHandler';

export async function getActiveTheme(): Promise<string | null> {
  const activeTheme = tokensSharedDataHandler.get(figma.root, SharedPluginDataKeys.tokens.activeTheme);
  if (activeTheme) {
    return activeTheme;
  }
  return null;
}

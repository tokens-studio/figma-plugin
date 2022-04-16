import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { tokensSharedDataHandler } from '@/plugin/SharedDataHandler';

export async function getUsedTokenSet(): Promise<string[] | null> {
  const usedTokenSets = tokensSharedDataHandler.get(figma.root, SharedPluginDataKeys.tokens.usedTokenSet);
  if (usedTokenSets) {
    return JSON.parse(usedTokenSets);
  }
  return null;
}

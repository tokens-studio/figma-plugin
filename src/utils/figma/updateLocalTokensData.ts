import * as pjs from '../../../package.json';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { tokensSharedDataHandler } from '@/plugin/SharedDataHandler';
import { ThemeObjectsMap, UsedTokenSetsMap } from '@/types';
import { AnyTokenSet } from '@/types/tokens';

type Payload = {
  tokens: AnyTokenSet
  themes: ThemeObjectsMap
  usedTokenSets: UsedTokenSetsMap
  activeTheme: string | null
  updatedAt: string
};

export function updateLocalTokensData(payload: Payload) {
  tokensSharedDataHandler.set(figma.root, SharedPluginDataKeys.tokens.version, pjs.plugin_version);
  tokensSharedDataHandler.set(figma.root, SharedPluginDataKeys.tokens.themes, JSON.stringify(payload.themes));
  tokensSharedDataHandler.set(figma.root, SharedPluginDataKeys.tokens.values, JSON.stringify(payload.tokens));
  tokensSharedDataHandler.set(figma.root, SharedPluginDataKeys.tokens.usedTokenSet, JSON.stringify(payload.usedTokenSets));
  tokensSharedDataHandler.set(figma.root, SharedPluginDataKeys.tokens.updatedAt, payload.updatedAt);
  tokensSharedDataHandler.set(figma.root, SharedPluginDataKeys.tokens.activeTheme, payload.activeTheme ?? '');
}

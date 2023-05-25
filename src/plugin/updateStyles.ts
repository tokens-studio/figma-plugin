import { SettingsState } from '@/app/store/models/settings';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenTypes } from '@/constants/TokenTypes';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AnyTokenList, SingleToken } from '@/types/tokens';
import { convertTokenNameToPath } from '@/utils/convertTokenNameToPath';
import { transformValue } from './helpers';
import updateColorStyles from './updateColorStyles';
import updateEffectStyles from './updateEffectStyles';
import updateTextStyles from './updateTextStyles';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { notifyUI } from './notifiers';

export default async function updateStyles(
  tokens: AnyTokenList,
  settings: SettingsState,
  shouldCreate = false,
): Promise<Record<string, string>> {
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const activeThemes = themeInfo.themes.filter((theme) => Object.values(themeInfo.activeTheme).some((v) => v === theme.id)).reverse();
  const styleTokens = tokens.map((token) => {
    // When multiple theme has the same active Token set then the last activeTheme wins
    const activeTheme = activeThemes.find((theme) => Object.entries(theme.selectedTokenSets).some(([tokenSet, status]) => status === TokenSetStatus.ENABLED && tokenSet === token.internal__Parent));
    const prefix = settings.prefixStylesWithThemeName && activeTheme ? activeTheme.name : null;
    const slice = settings?.ignoreFirstPartForStyles ? 1 : 0;
    const path = convertTokenNameToPath(token.name, prefix, slice);
    return {
      ...token,
      path,
      value: typeof token.value === 'string' ? transformValue(token.value, token.type, settings.baseFontSize) : token.value,
      styleId: activeTheme?.$figmaStyleReferences ? activeTheme?.$figmaStyleReferences[token.name] : '',
    } as SingleToken<true, { path: string, styleId: string }>;
  }).filter((token) => token.path);

  const colorTokens = styleTokens.filter((n) => [TokenTypes.COLOR].includes(n.type)) as Extract<
    typeof styleTokens[number],
  { type: TokenTypes.COLOR }
  >[];
  const textTokens = styleTokens.filter((n) => [TokenTypes.TYPOGRAPHY].includes(n.type)) as Extract<
    typeof styleTokens[number],
  { type: TokenTypes.TYPOGRAPHY }
  >[];
  const effectTokens = styleTokens.filter((n) => [TokenTypes.BOX_SHADOW].includes(n.type)) as Extract<
    typeof styleTokens[number],
  { type: TokenTypes.BOX_SHADOW }
  >[];

  if (!colorTokens && !textTokens && !effectTokens) return {};

  const allStyleIds = {
    ...(colorTokens.length > 0 ? updateColorStyles(colorTokens, shouldCreate) : {}),
    ...(textTokens.length > 0 ? updateTextStyles(textTokens, settings.baseFontSize, shouldCreate) : {}),
    ...(effectTokens.length > 0 ? updateEffectStyles(effectTokens, settings.baseFontSize, shouldCreate) : {}),
  };
  if (styleTokens.length < tokens.length && shouldCreate) {
    notifyUI('Some styles were not created due to your settings. Make sure Ignore first part of token name doesn\'t conflict', { error: true });
  }

  return allStyleIds;
}

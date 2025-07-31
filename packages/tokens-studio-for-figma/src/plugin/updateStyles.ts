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
import { notifyUI } from './notifiers';
import type { ThemeObject } from '@/types';

export default async function updateStyles(
  tokens: AnyTokenList,
  settings: SettingsState,
  shouldCreate = false,
  selectedTheme?: ThemeObject,
): Promise<Record<string, string>> {
  // Big O (n * m * l): (n = amount of tokens, m = amount of active themes, l = amount of tokenSets)
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const activeThemes = themeInfo.themes
    .filter((theme) => Object.values(themeInfo.activeTheme).some((v) => v === theme.id))
    .reverse();

  const styleTokens = tokens.map((token) => {
    // When multiple theme has the same active Token set then the last activeTheme wins
    const activeTheme = selectedTheme || activeThemes.find((theme) => Object.entries(theme.selectedTokenSets).some(([tokenSet]) => tokenSet === token.internal__Parent));

    const prefix = settings.prefixStylesWithThemeName && activeTheme ? activeTheme.name : null;
    const slice = settings?.ignoreFirstPartForStyles && token.name.split('.').length > 1 ? 1 : 0;
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

  const allStyleIds = await Promise.all([
    ...(colorTokens.length > 0 ? [updateColorStyles(colorTokens, shouldCreate, settings.renameExistingStylesAndVariables)] : []),
    ...(textTokens.length > 0 ? [updateTextStyles(textTokens, settings.baseFontSize, shouldCreate, settings.renameExistingStylesAndVariables)] : []),
    ...(effectTokens.length > 0 ? [updateEffectStyles({
      effectTokens, baseFontSize: settings.baseFontSize, shouldCreate, shouldRename: settings.renameExistingStylesAndVariables,
    })] : []),
  ]).then((results) => Object.assign({}, ...results));
  if (styleTokens.length < tokens.length && shouldCreate) {
    notifyUI('Some styles were ignored due to "Ignore first part of token name" export setting', { error: true });
  }

  return allStyleIds;
}

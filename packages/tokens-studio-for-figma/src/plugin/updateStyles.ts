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
  // Big O (n * m * l): (n = amount of tokens, m = amount of active themes, l = amount of tokenSets)
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const activeThemes = themeInfo.themes.filter((theme) => Object.values(themeInfo.activeTheme).some((v) => v === theme.id)).reverse();
  console.log('themes in createStyles: ', themeInfo.themes);
  console.log('tokens in createStyles: ', tokens);
  const styleTokens = tokens.map((token) => {
    // When multiple theme has the same active Token set then the last activeTheme wins
    const activeTheme = activeThemes.find((theme) => Object.entries(theme.selectedTokenSets).some(([tokenSet, status]) => status === TokenSetStatus.ENABLED && tokenSet === token.internal__Parent));
    const prefix = settings.prefixStylesWithThemeName && activeTheme ? activeTheme.name : null;
    const slice = settings?.ignoreFirstPartForStyles ? 1 : 0;
    const path = convertTokenNameToPath(token.name, prefix, slice);
    console.log('token in createStyles: ', token);
    console.log('activeTheme in createStyles: ', activeTheme);
    if (activeTheme && activeTheme.$figmaStyleReferences) {
      console.log('token figmaStyleReference in createStyles: ', activeTheme.$figmaStyleReferences[token.name]);
    }
    return {
      ...token,
      path,
      value: typeof token.value === 'string' ? transformValue(token.value, token.type, settings.baseFontSize) : token.value,
      styleId: activeTheme?.$figmaStyleReferences ? activeTheme?.$figmaStyleReferences[token.name] : '',
    } as SingleToken<true, { path: string, styleId: string }>;
  }).filter((token) => token.path);

  console.log('styleTokens in createStyles: ', styleTokens);

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
    notifyUI('Some styles were not created due to your settings. Make sure Ignore first part of token name doesn\'t conflict', { error: true });
  }

  console.log('allStyleIds in createStyles: ', allStyleIds);

  // Remove styles that aren't in the theme or in the exposed token object
  if (settings.removeStylesAndVariablesWithoutConnection) {
    const [allLocalPaintStyles, allLocalTextStyles, allLocalEffectStyles] = await Promise.all([
      figma.getLocalPaintStylesAsync(),
      figma.getLocalTextStylesAsync(),
      figma.getLocalEffectStylesAsync(),
    ]);
    const allLocalStyles = [...allLocalPaintStyles, ...allLocalTextStyles, ...allLocalEffectStyles];

    allLocalStyles
      .filter((style) => !Object.values(allStyleIds).includes(style.id))
      .forEach((style) => {
        style.remove();
      });
  }

  return allStyleIds;
}

import { SettingsState } from '@/app/store/models/settings';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenTypes } from '@/constants/TokenTypes';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import {
  AnyTokenList, SingleToken,
} from '@/types/tokens';
import { convertTokenNameToPath } from '@/utils/convertTokenNameToPath';
import { transformValue } from './helpers';
import updateColorStyles from './updateColorStyles';
import updateEffectStyles from './updateEffectStyles';
import updateTextStyles from './updateTextStyles';

export default async function updateStyles(
  tokens: AnyTokenList,
  shouldCreate = false,
  settings: Partial<SettingsState> = {},
): Promise<Record<string, string>> {
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const activeThemeObject = themeInfo.activeTheme
    ? themeInfo.themes.find(({ id }) => id === themeInfo.activeTheme)
    : null;

  const styleTokens = tokens.map((token) => {
    const prefix = settings.prefixStylesWithThemeName && activeThemeObject
      ? activeThemeObject.name
      : null;
    const slice = settings?.ignoreFirstPartForStyles ? 1 : 0;
    const path = convertTokenNameToPath(token.name, prefix, slice);
    return {
      ...token,
      path,
      value: (typeof token.value === 'string')
        ? transformValue(token.value, token.type)
        : token.value,
    } as SingleToken<true, {
      path: string
    }>;
  });

  const colorTokens = styleTokens.filter((n) => [TokenTypes.COLOR].includes(n.type)) as Extract<typeof styleTokens[number], { type: TokenTypes.COLOR }>[];
  const textTokens = styleTokens.filter((n) => [TokenTypes.TYPOGRAPHY].includes(n.type)) as Extract<typeof styleTokens[number], { type: TokenTypes.TYPOGRAPHY }>[];
  const effectTokens = styleTokens.filter((n) => [TokenTypes.BOX_SHADOW].includes(n.type)) as Extract<typeof styleTokens[number], { type: TokenTypes.BOX_SHADOW }>[];
  console.log('color', colorTokens);
  if (!colorTokens && !textTokens && !effectTokens) return {};

  const allStyleIds = {
    ...(colorTokens.length > 0 ? updateColorStyles(colorTokens, shouldCreate) : {}),
    ...(textTokens.length > 0 ? updateTextStyles(textTokens, shouldCreate) : {}),
    ...(effectTokens.length > 0 ? updateEffectStyles(effectTokens, shouldCreate) : {}),
  };
  return allStyleIds;
}

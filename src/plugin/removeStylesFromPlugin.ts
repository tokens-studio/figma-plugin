import compact from 'just-compact';
import { SettingsState } from '@/app/store/models/settings';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { DeleteTokenPayload } from '@/types/payloads';
import { convertTokenNameToPath } from '@/utils/convertTokenNameToPath';
import { isMatchingStyle } from '@/utils/is/isMatchingStyle';

export default async function removeStylesFromPlugin(
  token: DeleteTokenPayload,
  settings: Partial<SettingsState> = {},
) {
  const effectStyles = figma.getLocalEffectStyles();
  const paintStyles = figma.getLocalPaintStyles();
  const textStyles = figma.getLocalTextStyles();
  const allStyles = [...effectStyles, ...paintStyles, ...textStyles];
  const figmaStyleMaps = new Map(allStyles.map((style) => ([style.name, style])));

  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const activeThemeObject = themeInfo.activeTheme
    ? themeInfo.themes.find(({ id }) => id === themeInfo.activeTheme)
    : null;

  const stylePathSlice = settings?.ignoreFirstPartForStyles ? 1 : 0;
  const stylePathPrefix = settings?.prefixStylesWithThemeName && activeThemeObject
    ? activeThemeObject.name
    : null;

  const pathname = convertTokenNameToPath(token.path, stylePathPrefix, stylePathSlice);
  const allStyleIds = allStyles.map((style) => {
    if (isMatchingStyle(token.path, pathname, activeThemeObject?.$figmaStyleReferences ?? {}, figmaStyleMaps)) {
      style.remove();
      return style.id;
    }
    return null;
  });

  return compact(allStyleIds);
}

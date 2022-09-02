import { SettingsState } from '@/app/store/models/settings';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { convertTokenNameToPath } from '@/utils/convertTokenNameToPath';
import { matchStyleName } from '@/utils/matchStyleName';

export default async function renameStylesFromPlugin(
  oldName: string,
  newName: string,
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

  const pathname = convertTokenNameToPath(oldName, stylePathPrefix, stylePathSlice);
  const matchingStyleId = matchStyleName(
    oldName,
    pathname,
    activeThemeObject?.$figmaStyleReferences ?? {},
    figmaStyleMaps,
  );
  if (matchingStyleId) {
    const target = figma.getStyleById(matchingStyleId);
    if (target) target.name = newName;
  }
}

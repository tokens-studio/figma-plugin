import { SettingsState } from '@/app/store/models/settings';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { DeleteTokenPayload } from '@/types/payloads';
import { convertTokenNameToPath } from '@/utils/convertTokenNameToPath';
import { getAllFigmaStyleMaps } from '@/utils/getAllFigmaStyleMaps';
import { matchStyleName } from '@/utils/matchStyleName';

export default async function removeStylesFromPlugin(
  token: DeleteTokenPayload,
  settings: Partial<SettingsState> = {},
) {
  const figmaStyleMaps = getAllFigmaStyleMaps();
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
  const matchingStyleId = matchStyleName(
    token.path,
    pathname,
    activeThemeObject?.$figmaStyleReferences ?? {},
    figmaStyleMaps.effectStyles,
  );
}

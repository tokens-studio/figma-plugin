import { SettingsState } from '@/app/store/models/settings';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
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

  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  console.log('theminf', themeInfo, 'toke', token)
  const activeThemeObject = themeInfo.activeTheme
    ? themeInfo.themes.find(({ id }) => id === themeInfo.activeTheme)
    : null;

  const candidateThems = themeInfo.themes.filter(theme =>
    Object.entries(theme.selectedTokenSets).some(([tokenSet, value]) => {
      tokenSet === token.parent && value === TokenSetStatus.ENABLED
    })
  ).map(filteredTheme => filteredTheme.name);

  const stylePathSlice = settings?.ignoreFirstPartForStyles ? 1 : 0;
  const stylePathPrefix = settings?.prefixStylesWithThemeName && activeThemeObject
    ? activeThemeObject.name
    : null;

  const pathname = convertTokenNameToPath(token.path, stylePathPrefix, stylePathSlice);

  const allStyleIds = allStyles.filter((style) => isMatchingStyle(pathname, style))
    .map((filtedStyle) => {
      filtedStyle.remove();
      return filtedStyle.id;
    });
  return allStyleIds;
}

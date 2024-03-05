import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { DeleteTokenPayload } from '@/types/payloads';
import { convertTokenNameToPath } from '@/utils/convertTokenNameToPath';
import { isMatchingStyle } from '@/utils/is/isMatchingStyle';

export default async function removeStylesFromPlugin(token: DeleteTokenPayload) {
  const effectStyles = figma.getLocalEffectStyles();
  const paintStyles = figma.getLocalPaintStyles();
  const textStyles = figma.getLocalTextStyles();
  const allStyles = [...effectStyles, ...paintStyles, ...textStyles];

  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const themesToContainToken = themeInfo.themes
    .filter((theme) => Object.entries(theme.selectedTokenSets).some(
      ([tokenSet, value]) => tokenSet === token.parent && value === TokenSetStatus.ENABLED,
    ))
    .map((filteredTheme) => filteredTheme.name);
  const pathNames = themesToContainToken.map((theme) => convertTokenNameToPath(token.path, theme));

  const allStyleIds = allStyles
    .filter((style) => pathNames.some((pathName) => isMatchingStyle(pathName, style)))
    .map((filteredStyle) => {
      filteredStyle.remove();
      return filteredStyle.id;
    });
  return allStyleIds;
}

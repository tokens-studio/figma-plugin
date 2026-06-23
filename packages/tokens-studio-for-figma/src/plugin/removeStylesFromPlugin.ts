import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { SettingsState } from '@/app/store/models/settings';
import { DeleteTokenPayload } from '@/types/payloads';
import { convertTokenNameToPath } from '@/utils/convertTokenNameToPath';
import { isMatchingStyle } from '@/utils/is/isMatchingStyle';

export default async function removeStylesFromPlugin(token: DeleteTokenPayload, settings: Partial<SettingsState> = {}) {
  const effectStyles = figma.getLocalEffectStyles();
  const paintStyles = figma.getLocalPaintStyles();
  const textStyles = figma.getLocalTextStyles();
  const allStyles = [...effectStyles, ...paintStyles, ...textStyles];

  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const slice = settings.ignoreFirstPartForStyles && token.path.split('.').length > 1 ? 1 : 0;
  const themesToContainToken = themeInfo.themes
    .filter((theme) => Object.entries(theme.selectedTokenSets).some(
      ([tokenSet, value]) => tokenSet === token.parent && value === TokenSetStatus.ENABLED,
    ));
  const pathNames = themesToContainToken.map((theme) => {
    const prefix = settings.prefixStylesWithThemeName ? theme.name : null;
    return convertTokenNameToPath(token.path, prefix, slice);
  });

  const allStyleIds = allStyles
    .filter((style) => pathNames.some((pathName) => isMatchingStyle(pathName, style)))
    .map((filteredStyle) => {
      filteredStyle.remove();
      return filteredStyle.id;
    });
  return allStyleIds;
}

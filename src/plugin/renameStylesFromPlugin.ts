import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { convertTokenNameToPath } from '@/utils/convertTokenNameToPath';
import { isMatchingStyle } from '@/utils/is';

export default async function renameStylesFromPlugin(
  oldName: string,
  newName: string,
  parent: string,
) {
  const effectStyles = figma.getLocalEffectStyles();
  const paintStyles = figma.getLocalPaintStyles();
  const textStyles = figma.getLocalTextStyles();
  const allStyles = [...effectStyles, ...paintStyles, ...textStyles];

  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });

  const themesToContainToken = themeInfo.themes.filter((theme) => Object.entries(theme.selectedTokenSets).some(([tokenSet, value]) => tokenSet === parent && value === TokenSetStatus.ENABLED)).map((filteredTheme) => filteredTheme.name);
  const oldPathNames = themesToContainToken.map((theme) => convertTokenNameToPath(oldName, theme)).concat(themesToContainToken.map(() => convertTokenNameToPath(oldName, null, 1))).concat(convertTokenNameToPath(oldName));
  const newPathNames = themesToContainToken.map((theme) => convertTokenNameToPath(newName, theme)).concat(themesToContainToken.map(() => convertTokenNameToPath(newName, null, 1))).concat(convertTokenNameToPath(newName));
  const allStyleIds = allStyles.filter((style) => oldPathNames.some((oldPathName) => {
    if (isMatchingStyle(oldPathName, style)) {
      const index = oldPathNames.findIndex((item) => item === oldPathName);
      style.name = newPathNames[index];
      return true;
    }
    return false;
  })).map((filteredStyle) => filteredStyle.id);

  return allStyleIds;
}

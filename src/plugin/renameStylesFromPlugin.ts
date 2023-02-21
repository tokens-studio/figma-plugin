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
  const pathNames = themesToContainToken.map((theme) => convertTokenNameToPath(oldName, theme)).concat(convertTokenNameToPath(oldName));
  const allStyleIds = allStyles.filter((style) => pathNames.some((pathName) => {
    if (isMatchingStyle(pathName, style)) {
      const oldPath = oldName.split('.').map((part) => part.trim()).join('/');
      const newPath = newName.split('.').map((part) => part.trim()).join('/');
      style.name = pathName.replace(oldPath, newPath);
      return true;
    }
    return false;
  })).map((filteredStyle) => filteredStyle.id);

  return allStyleIds;
}

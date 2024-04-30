import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokensToRenamePayload } from '@/app/store/useTokens';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { convertTokenNameToPath } from '@/utils/convertTokenNameToPath';
import { isMatchingStyle } from '@/utils/is';

export default async function renameStylesFromPlugin(
  tokensToRename: TokensToRenamePayload[],
  parent: string,
) {
  const [effectStyles, paintStyles, textStyles] = await Promise.all([
    figma.getLocalEffectStylesAsync(),
    figma.getLocalPaintStylesAsync(),
    figma.getLocalTextStylesAsync(),
  ]);
  const allStyles = [...effectStyles, ...paintStyles, ...textStyles];

  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });

  const themesToContainToken = themeInfo.themes.filter((theme) => Object.entries(theme.selectedTokenSets).some(([tokenSet, value]) => tokenSet === parent && value === TokenSetStatus.ENABLED)).map((filteredTheme) => filteredTheme.name);
  let oldPathNames: string[] = [];
  let newPathNames: string[] = [];

  // TODO: This behavior feels so weird. We should refactor this to be more readable, also this can lead to unexpected side-effects.
  tokensToRename.forEach((token) => {
    oldPathNames = oldPathNames
      .concat(themesToContainToken.map((theme) => convertTokenNameToPath(token.oldName, theme)))
      .concat(themesToContainToken.map((theme) => convertTokenNameToPath(token.oldName, theme, 1)))
      .concat(themesToContainToken.map(() => convertTokenNameToPath(token.oldName, null, 1)))
      .concat(convertTokenNameToPath(token.oldName));
    newPathNames = newPathNames
      .concat(themesToContainToken.map((theme) => convertTokenNameToPath(token.newName, theme)))
      .concat(themesToContainToken.map((theme) => convertTokenNameToPath(token.newName, theme, 1)))
      .concat(themesToContainToken.map(() => convertTokenNameToPath(token.newName, null, 1)))
      .concat(convertTokenNameToPath(token.newName));
  });
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

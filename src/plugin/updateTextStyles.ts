import compact from 'just-compact';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { getTextStylesKeyMap } from '@/utils/getTextStylesKeyMap';
import setTextValuesOnTarget from './setTextValuesOnTarget';
import type { SinglePathToken } from './updateStyles';

// Iterate over textTokens to create objects that match figma styles
// @returns A map of token names and their respective style IDs (if created or found)
export default async function updateTextStyles(textTokens: SinglePathToken[], shouldCreate = false) {
  const themeInfo = await AsyncMessageChannel.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const activeThemeObject = themeInfo.activeTheme
    ? themeInfo.themes.find(({ id }) => id === themeInfo.activeTheme)
    : null;

  const textStylesToKeyMap = getTextStylesKeyMap();
  const tokenToStyleMap: Record<string, string> = {};

  textTokens.forEach((token) => {
    const possibleStyleNames = [
      token.path,
      compact([activeThemeObject?.name, token.path]).join('/'),
    ];
    const matchingStyleName = possibleStyleNames.find((path) => (
      textStylesToKeyMap.has(path)
    ));

    if (matchingStyleName) {
      const textStyle = textStylesToKeyMap.get(matchingStyleName)!;
      tokenToStyleMap[token.name] = textStyle.id;
      setTextValuesOnTarget(textStyle, token);
    } else if (shouldCreate) {
      const style = figma.createTextStyle();
      style.name = compact([activeThemeObject?.name, token.path]).join('/');
      tokenToStyleMap[token.name] = style.id;
      setTextValuesOnTarget(style, token);
    }
  });

  return tokenToStyleMap;
}

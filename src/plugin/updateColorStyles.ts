import compact from 'just-compact';
import setColorValuesOnTarget from './setColorValuesOnTarget';
import { getPaintStylesKeyMap } from '@/utils/getPaintStylesKeyMap';
import { TokenTypes } from '@/constants/TokenTypes';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import type { SinglePathToken } from './updateStyles';

// Iterate over colorTokens to create objects that match figma styles
// @returns A map of token names and their respective style IDs (if created or found)
export default async function updateColorStyles(colorTokens: SinglePathToken[], shouldCreate = false): Promise<Record<string, string>> {
  const themeInfo = await AsyncMessageChannel.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const activeThemeObject = themeInfo.activeTheme
    ? themeInfo.themes.find(({ id }) => id === themeInfo.activeTheme)
    : null;

  const paintToKeyMap = getPaintStylesKeyMap();
  const tokenToStyleMap: Record<string, string> = {};

  colorTokens.forEach((token) => {
    if (token.type === TokenTypes.COLOR) {
      const possibleStyleNames = [
        token.path,
        compact([activeThemeObject?.name, token.path]).join('/'),
      ];
      const matchingStyleName = possibleStyleNames.find((path) => (
        paintToKeyMap.has(path)
      ));

      if (matchingStyleName) {
        const painStyle = paintToKeyMap.get(matchingStyleName)!;
        tokenToStyleMap[token.path] = painStyle.id;
        setColorValuesOnTarget(painStyle, token);
      } else if (shouldCreate) {
        const style = figma.createPaintStyle();
        style.name = compact([activeThemeObject?.name, token.path]).join('/');
        tokenToStyleMap[token.name] = style.id;
        setColorValuesOnTarget(style, token);
      }
    }
  });

  return tokenToStyleMap;
}

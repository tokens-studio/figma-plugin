import { SingleTypographyToken } from '@/types/tokens';
import { getTextStylesKeyMap } from '@/utils/getTextStylesKeyMap';
import setTextValuesOnTarget from './setTextValuesOnTarget';

// Iterate over colorTokens to create objects that match figma styles
// @returns A map of token names and their respective style IDs (if created or found)
export default function updateTextStyles(textTokens: SingleTypographyToken<true, { path: string }>[], baseFontSize: string, shouldCreate = false) {
  // Iterate over textTokens to create objects that match figma styles
  const textStylesToKeyMap = getTextStylesKeyMap();
  const tokenToStyleMap: Record<string, string> = {};

  textTokens.forEach((token) => {
    if (textStylesToKeyMap.has(token.path)) {
      const textStyle = textStylesToKeyMap.get(token.path)!;
      tokenToStyleMap[token.name] = textStyle.id;
      setTextValuesOnTarget(textStyle, token, baseFontSize);
    } else if (shouldCreate) {
      const style = figma.createTextStyle();
      style.name = token.path;
      tokenToStyleMap[token.name] = style.id;
      setTextValuesOnTarget(style, token, baseFontSize);
    }
  });

  return tokenToStyleMap;
}

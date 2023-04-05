import { SingleTypographyToken } from '@/types/tokens';
import setTextValuesOnTarget from './setTextValuesOnTarget';
import { getTextStylesIdMap } from '@/utils/getTextStylesIdMap';

// Iterate over colorTokens to create objects that match figma styles
// @returns A map of token names and their respective style IDs (if created or found)
export default function updateTextStyles(textTokens: SingleTypographyToken<true, { path: string, styleId: string }>[], baseFontSize: string, shouldCreate = false) {
  // Iterate over textTokens to create objects that match figma styles
  const textStylesToIdMap = getTextStylesIdMap();
  const tokenToStyleMap: Record<string, string> = {};

  textTokens.forEach((token) => {
    if (textStylesToIdMap.has(token.styleId)) {
      const textStyle = textStylesToIdMap.get(token.styleId)!;
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

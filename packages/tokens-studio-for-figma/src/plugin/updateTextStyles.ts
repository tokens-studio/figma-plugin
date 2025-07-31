import { SingleTypographyToken } from '@/types/tokens';
import { setTextValuesOnTarget } from './setTextValuesOnTarget';
import { getTextStylesIdMap } from '@/utils/getTextStylesIdMap';
import { getTextStylesKeyMap } from '@/utils/getTextStylesKeyMap';

// Iterate over colorTokens to create objects that match figma styles
// @returns A map of token names and their respective style IDs (if created or found)
export default async function updateTextStyles(textTokens: SingleTypographyToken<true, { path: string, styleId: string }>[], baseFontSize: string, shouldCreate = false, shouldRename = false) {
  // Iterate over textTokens to create objects that match figma styles
  const textStylesToIdMap = getTextStylesIdMap();
  const textStylesToKeyMap = getTextStylesKeyMap();
  const tokenToStyleMap: Record<string, string> = {};

  await Promise.all(textTokens.map(async (token) => {
    if (textStylesToIdMap.has(token.styleId)) {
      const textStyle = textStylesToIdMap.get(token.styleId)!;
      if (shouldRename) {
        textStyle.name = token.path;
      }
      tokenToStyleMap[token.name] = textStyle.id;
      await setTextValuesOnTarget(textStyle, token.name, baseFontSize);
    } else if (textStylesToKeyMap.has(token.path)) {
      const textStyle = textStylesToKeyMap.get(token.path)!;
      tokenToStyleMap[token.name] = textStyle.id;
      await setTextValuesOnTarget(textStyle, token.name, baseFontSize);
    } else if (shouldCreate) {
      const style = figma.createTextStyle();
      style.name = token.path;
      tokenToStyleMap[token.name] = style.id;
      await setTextValuesOnTarget(style, token.name, baseFontSize);
    }
  }));

  return tokenToStyleMap;
}

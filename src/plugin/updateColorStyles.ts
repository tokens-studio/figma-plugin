import { SingleColorToken } from '@/types/tokens';
import setColorValuesOnTarget from './setColorValuesOnTarget';
import { getPaintStylesIdMap } from '@/utils/getPaintStylesIdMap';
import { getPaintStylesKeyMap } from '@/utils/getPaintStylesKeyMap';

// Iterate over colorTokens to create objects that match figma styles
// @returns A map of token names and their respective style IDs (if created or found)
export default function updateColorStyles(colorTokens: SingleColorToken<true, { path: string, styleId: string }>[], shouldCreate = false) {
  const paintToIdMap = getPaintStylesIdMap();
  const paintToKeyMap = getPaintStylesKeyMap();
  const tokenToStyleMap: Record<string, string> = {};

  colorTokens.forEach((token) => {
    if (paintToIdMap.has(token.styleId)) {
      const paint = paintToIdMap.get(token.styleId)!;
      tokenToStyleMap[token.name] = paint.id;
      setColorValuesOnTarget(paint, token);
    } else if (paintToKeyMap.has(token.path)) {
      const paint = paintToKeyMap.get(token.path)!;
      tokenToStyleMap[token.name] = paint.id;
      setColorValuesOnTarget(paint, token);
    } else if (shouldCreate) {
      const style = figma.createPaintStyle();
      style.name = token.path;
      tokenToStyleMap[token.name] = style.id;
      setColorValuesOnTarget(style, token);
    }
  });
  return tokenToStyleMap;
}

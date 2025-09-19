import { SingleColorToken } from '@/types/tokens';
import setColorValuesOnTarget from './setColorValuesOnTarget';
import { getPaintStylesIdMap } from '@/utils/getPaintStylesIdMap';
import { getPaintStylesKeyMap } from '@/utils/getPaintStylesKeyMap';
import { processBatches } from '@/utils/processBatches';

// Iterate over colorTokens to create objects that match figma styles
// @returns A map of token names and their respective style IDs (if created or found)
export default async function updateColorStyles(colorTokens: SingleColorToken<true, { path: string, styleId: string }>[], shouldCreate = false, shouldRename = false, onProgress?: (completed: number) => void) {
  const paintToIdMap = getPaintStylesIdMap();
  const paintToKeyMap = getPaintStylesKeyMap();
  const tokenToStyleMap: Record<string, string> = {};

  // Process tokens in batches of 50 to avoid overwhelming memory and API limits
  await processBatches(colorTokens, 50, async (token) => {
    if (paintToIdMap.has(token.styleId)) {
      const paint = paintToIdMap.get(token.styleId)!;
      if (shouldRename) {
        paint.name = token.path;
      }
      tokenToStyleMap[token.name] = paint.id;
      await setColorValuesOnTarget({ target: paint, token: token.name, key: 'paints' });
    } else if (paintToKeyMap.has(token.path)) {
      const paint = paintToKeyMap.get(token.path)!;
      tokenToStyleMap[token.name] = paint.id;
      await setColorValuesOnTarget({ target: paint, token: token.name, key: 'paints' });
    } else if (shouldCreate) {
      const style = figma.createPaintStyle();
      style.name = token.path;
      tokenToStyleMap[token.name] = style.id;
      await setColorValuesOnTarget({ target: style, token: token.name, key: 'paints' });
    }
  }, onProgress);
  return tokenToStyleMap;
}

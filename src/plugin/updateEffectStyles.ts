import { SingleBoxShadowToken } from '@/types/tokens';
import setEffectValuesOnTarget from './setEffectValuesOnTarget';
import { getEffectStylesIdMap } from '@/utils/getEffectStylesIdMap';

// Iterate over effectTokens to create objects that match figma styles
// @returns A map of token names and their respective style IDs (if created or found)
export default function updateEffectStyles(effectTokens: SingleBoxShadowToken<true, { path: string, styleId: string }>[], baseFontSize: string, shouldCreate = false) {
  const effectStylesToIdMap = getEffectStylesIdMap();
  const tokenToStyleMap: Record<string, string> = {};

  effectTokens.forEach((token) => {
    if (effectStylesToIdMap.has(token.styleId)) {
      const effectStyle = effectStylesToIdMap.get(token.styleId)!;
      tokenToStyleMap[token.name] = effectStyle.id;
      setEffectValuesOnTarget(effectStyle, token, baseFontSize);
    } else if (shouldCreate) {
      const style = figma.createEffectStyle();
      style.name = token.path;
      tokenToStyleMap[token.name] = style.id;
      setEffectValuesOnTarget(style, token, baseFontSize);
    }
  });

  return tokenToStyleMap;
}

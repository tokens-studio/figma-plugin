import { SingleBoxShadowToken } from '@/types/tokens';
import { getEffectStylesKeyMap } from '@/utils/getEffectStylesKeyMap';
import setEffectValuesOnTarget from './setEffectValuesOnTarget';

// Iterate over effectTokens to create objects that match figma styles
// @returns A map of token names and their respective style IDs (if created or found)
export default function updateEffectStyles(effectTokens: SingleBoxShadowToken<true, { path: string }>[], shouldCreate = false) {
  const effectStylesToKeyMap = getEffectStylesKeyMap();
  const tokenToStyleMap: Record<string, string> = {};

  effectTokens.forEach((token) => {
    if (effectStylesToKeyMap.has(token.path)) {
      const effectStyle = effectStylesToKeyMap.get(token.path)!;
      tokenToStyleMap[token.path] = effectStyle.id;
      setEffectValuesOnTarget(effectStyle, token);
    } else if (shouldCreate) {
      const style = figma.createEffectStyle();
      style.name = token.path;
      tokenToStyleMap[token.path] = style.id;
      setEffectValuesOnTarget(style, token);
    }
  });

  return tokenToStyleMap;
}

import { SingleBoxShadowToken } from '@/types/tokens';
import setEffectValuesOnTarget from './setEffectValuesOnTarget';
import { getEffectStylesIdMap } from '@/utils/getEffectStylesIdMap';
import { getEffectStylesKeyMap } from '@/utils/getEffectStylesKeyMap';

// Iterate over effectTokens to create objects that match figma styles
// @returns A map of token names and their respective style IDs (if created or found)
export default async function updateEffectStyles({
  effectTokens,
  baseFontSize,
  shouldCreate = false,
  shouldRename = false,
}: {
  effectTokens: SingleBoxShadowToken<true, { path: string; styleId: string }>[];
  baseFontSize: string;
  shouldCreate?: boolean;
  shouldRename?: boolean;
}) {
  const effectStylesToIdMap = getEffectStylesIdMap();
  const effectStylesToKeyMap = getEffectStylesKeyMap();
  const tokenToStyleMap: Record<string, string> = {};

  console.log('effectTokens in updateEffectStyles: ', effectTokens);
  console.log('effectStylesToIdMap in updateEffectStyles: ', effectStylesToIdMap);
  console.log('effectStylesToKeyMap in updateEffectStyles: ', effectStylesToKeyMap);

  await Promise.all(effectTokens.map(async (token) => {
    if (effectStylesToIdMap.has(token.styleId)) {
      const effectStyle = effectStylesToIdMap.get(token.styleId)!;
      if (shouldRename) {
        effectStyle.name = token.path;
      }
      tokenToStyleMap[token.name] = effectStyle.id;
      await setEffectValuesOnTarget(effectStyle, token.name, baseFontSize);
    } else if (effectStylesToKeyMap.has(token.path)) {
      const effectStyle = effectStylesToKeyMap.get(token.path)!;
      tokenToStyleMap[token.name] = effectStyle.id;

      await setEffectValuesOnTarget(effectStyle, token.name, baseFontSize);
    } else if (shouldCreate) {
      console.log('1111111 in updateEffectStyles');
      const style = figma.createEffectStyle();
      console.log('token.path in updateEffectStyles: ', token.path);
      style.name = token.path;
      tokenToStyleMap[token.name] = style.id;

      await setEffectValuesOnTarget(style, token.name, baseFontSize);
    }
  }));

  console.log('tokenToStyleMap in updateEffectStyles: ', tokenToStyleMap);

  return tokenToStyleMap;
}

import { SingleBoxShadowToken } from '@/types/tokens';
import { getEffectStylesKeyMap } from '@/utils/getEffectStylesKeyMap';
import { normalizeTokenName } from '@/utils/normalizeTokenName';
import setEffectValuesOnTarget from './setEffectValuesOnTarget';

// Iterate over effectTokens to create objects that match figma styles
export default function updateEffectStyles(effectTokens: SingleBoxShadowToken[], shouldCreate = false) {
  const effectStylesToKeyMap = getEffectStylesKeyMap();

  effectTokens.forEach((token) => {
    const trimmedKey = normalizeTokenName(token.name);

    if (effectStylesToKeyMap.has(trimmedKey)) {
      setEffectValuesOnTarget(effectStylesToKeyMap.get(trimmedKey)!, token);
    } else if (shouldCreate) {
      const style = figma.createEffectStyle();
      style.name = token.name;
      setEffectValuesOnTarget(style, token);
    }
  });
}

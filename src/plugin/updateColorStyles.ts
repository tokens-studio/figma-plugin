import { SingleToken } from '@/types/tokens';
import setColorValuesOnTarget from './setColorValuesOnTarget';
import { normalizeTokenName } from '@/utils/normalizeTokenName';
import { getPaintStylesKeyMap } from '@/utils/getPaintStylesKeyMap';
import { TokenTypes } from '@/constants/TokenTypes';

// Iterate over colorTokens to create objects that match figma styles
export default function updateColorStyles(colorTokens: SingleToken[], shouldCreate = false) {
  const paintToKeyMap = getPaintStylesKeyMap();

  colorTokens.forEach((token: SingleToken) => {
    if (token.type === TokenTypes.COLOR) {
      const trimmedKey = normalizeTokenName(token.name);

      if (paintToKeyMap.has(trimmedKey)) {
        setColorValuesOnTarget(paintToKeyMap.get(trimmedKey)!, token);
      } else if (shouldCreate) {
        const style = figma.createPaintStyle();
        style.name = token.name;
        setColorValuesOnTarget(style, token);
      }
    }
  });
}

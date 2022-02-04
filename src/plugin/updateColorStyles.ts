import { SingleTokenObject } from '@/types/tokens';
import { ColorToken } from '../types/propertyTypes';
import setColorValuesOnTarget from './setColorValuesOnTarget';
import { normalizeTokenName } from '@/utils/normalizeTokenName';
import { getPaintStylesKeyMap } from '@/utils/getPaintStylesKeyMap';

// Iterate over colorTokens to create objects that match figma styles
export default function updateColorStyles(colorTokens: SingleTokenObject[], shouldCreate = false) {
  const paintToKeyMap = getPaintStylesKeyMap();

  colorTokens.forEach((token: ColorToken) => {
    const trimmedKey = normalizeTokenName(token.name);

    if (paintToKeyMap.has(trimmedKey)) {
      setColorValuesOnTarget(paintToKeyMap.get(trimmedKey)!, token);
    } else if (shouldCreate) {
      const style = figma.createPaintStyle();
      style.name = token.name;
      setColorValuesOnTarget(style, token);
    }
  });
}

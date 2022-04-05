import { SingleToken } from '@/types/tokens';
import { getTextStylesKeyMap } from '@/utils/getTextStylesKeyMap';
import { normalizeTokenName } from '@/utils/normalizeTokenName';
import setTextValuesOnTarget from './setTextValuesOnTarget';

export default function updateTextStyles(textTokens: SingleToken[], shouldCreate = false) {
  // Iterate over textTokens to create objects that match figma styles
  const textStylesToKeyMap = getTextStylesKeyMap();

  textTokens.forEach((token) => {
    const trimmedKey = normalizeTokenName(token.name);

    if (textStylesToKeyMap.has(trimmedKey)) {
      setTextValuesOnTarget(textStylesToKeyMap.get(trimmedKey)!, token);
    } else if (shouldCreate) {
      const style = figma.createTextStyle();
      style.name = token.name;
      setTextValuesOnTarget(style, token);
    }
  });
}

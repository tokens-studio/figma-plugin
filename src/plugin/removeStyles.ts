import { DeleteTokenPayload } from '@/types/payloads';
import { isMatchingStyle } from '@/utils/is/isMatchingStyle';

export default async function removeStylesFromPlugin(
  token: DeleteTokenPayload,
) {
  const colorStyles = await figma.getLocalPaintStyles();
  const textStyles = await figma.getLocalTextStyles();
  const effectStyles = await figma.getLocalEffectStyles();
  const allStyles = [...colorStyles, ...textStyles, ...effectStyles];
  allStyles.forEach((style) => {
    if (isMatchingStyle(style, token)) style.remove();
  });
}

import { SingleToken } from '@/types/tokens';
import { isMatchingStyle } from '@/utils/is/isMatchingStyle';

export default async function removeStylesFromPlugin(
  token: SingleToken,
) {
  const colorStyles = await figma.getLocalPaintStyles();
  const textStyles = await figma.getLocalTextStyles();
  const effectStyles = await figma.getLocalEffectStyles();
  const allStyles = [...colorStyles, ...textStyles, ...effectStyles];
  console.log('tokne', token);
  allStyles.forEach((style) => {
    console.log('bolle', style, isMatchingStyle(style, token));
    if (isMatchingStyle(style, token)) style.remove();
  });
}

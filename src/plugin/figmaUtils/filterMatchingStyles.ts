import { SingleToken } from '@/types/tokens';

export default function filterMatchingStyles(
  token: SingleToken,
  styles: Array<EffectStyle | PaintStyle | TextStyle>,
): Array<EffectStyle | PaintStyle | TextStyle> {
  return styles.filter((style) => {
    const splitName = style.name.split('/').map((name) => name.trim());
    const splitKey = token.name.split('.').map((name) => name.trim());

    if (splitKey[splitKey.length - 1] === 'value') {
      splitKey.pop();
    }
    const trimmedName = splitName.join('/');
    const trimmedKey = splitKey.join('/');

    return trimmedName === trimmedKey;
  });
}

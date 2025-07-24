export function isMatchingStyle(
  tokenPath: string,
  style: EffectStyle | PaintStyle | TextStyle,
) {
  const splitName = style.name.split('/').map((name) => name.trim());
  const trimmedName = splitName.join('/');

  return trimmedName === tokenPath;
}

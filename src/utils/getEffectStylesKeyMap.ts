export function getEffectStylesKeyMap() {
  const effectStyles = figma.getLocalEffectStyles();
  const effectStylesToKeyMap = new Map<string, EffectStyle>();
  effectStyles.forEach((style) => {
    const splitName = style.name.split('/').map((name) => name.trim());
    const trimmedName = splitName.join('/');
    return effectStylesToKeyMap.set(trimmedName, style);
  });
  return effectStylesToKeyMap;
}

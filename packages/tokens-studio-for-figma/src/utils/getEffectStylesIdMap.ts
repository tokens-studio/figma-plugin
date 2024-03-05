export function getEffectStylesIdMap() {
  const effectStyles = figma.getLocalEffectStyles();
  const effectStylesToIdMap = new Map<string, EffectStyle>();
  effectStyles.forEach((style) => effectStylesToIdMap.set(style.id, style));
  return effectStylesToIdMap;
}

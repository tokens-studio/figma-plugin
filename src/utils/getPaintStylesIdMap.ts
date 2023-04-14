export function getPaintStylesIdMap() {
  const paints = figma.getLocalPaintStyles();
  const paintToIdMap = new Map<string, PaintStyle>();
  paints.forEach((style) => paintToIdMap.set(style.id, style));
  return paintToIdMap;
}

export function getPaintStylesKeyMap() {
  const paints = figma.getLocalPaintStyles();
  const paintToKeyMap = new Map<string, PaintStyle>();
  paints.forEach((style) => {
    const splitName = style.name.split('/').map((name) => name.trim());
    const trimmedName = splitName.join('/');
    return paintToKeyMap.set(trimmedName, style);
  });
  return paintToKeyMap;
}

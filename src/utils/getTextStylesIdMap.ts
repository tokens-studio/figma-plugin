export function getTextStylesIdMap() {
  const textStyles = figma.getLocalTextStyles();
  const textStyleToIdMap = new Map<string, TextStyle>();
  textStyles.forEach((style) => textStyleToIdMap.set(style.id, style));
  return textStyleToIdMap;
}

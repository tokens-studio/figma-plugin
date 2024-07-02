export function getTextStylesKeyMap() {
  const textStyles = figma.getLocalTextStyles();
  const textStyleToKeyMap = new Map<string, TextStyle>();
  textStyles.forEach((style) => {
    const splitName = style.name.split('/').map((name) => name.trim());
    const trimmedName = splitName.join('/');
    return textStyleToKeyMap.set(trimmedName, style);
  });
  return textStyleToKeyMap;
}

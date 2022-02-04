export function getAllFigmaStyleMaps() {
  const effectStyles = figma.getLocalEffectStyles();
  const paintStyles = figma.getLocalPaintStyles();
  const textStyles = figma.getLocalTextStyles();

  return {
    effectStyles: new Map(effectStyles.map((style) => ([style.name, style]))),
    paintStyles: new Map(paintStyles.map((style) => ([style.name, style]))),
    textStyles: new Map(textStyles.map((style) => ([style.name, style]))),
  };
}

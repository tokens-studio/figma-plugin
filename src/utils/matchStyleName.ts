export function matchStyleName<T extends EffectStyle | PaintStyle | TextStyle>(
  tokenName: string,
  tokenPath: string,
  figmaStyleReferences: Record<string, string>,
  stylesMap?: Map<string, T>,
) {
  return (
    figmaStyleReferences[tokenName]
    || (stylesMap ? stylesMap.get(tokenName)?.id : undefined)
    || figmaStyleReferences[tokenPath]
    || (stylesMap ? stylesMap.get(tokenPath)?.id : undefined)
    // during the non-local styles beta we saved the figmaStyleReferences by their path
    // which includes the theme name
  );
}

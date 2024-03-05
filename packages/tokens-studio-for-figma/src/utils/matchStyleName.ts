export function matchStyleName<T extends EffectStyle | PaintStyle | TextStyle>(
  tokenName: string,
  tokenPath: string,
  figmaStyleReferences: Record<string, string>,
  stylesMap?: Map<string, T>,
) {
  return (
    figmaStyleReferences[tokenName]
    || stylesMap?.get(tokenName)?.id
    || figmaStyleReferences[tokenPath]
    || stylesMap?.get(tokenPath)?.id
    // during the non-local styles beta we saved the figmaStyleReferences by their path
    // which includes the theme name
  );
}

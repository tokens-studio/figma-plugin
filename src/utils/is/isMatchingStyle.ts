export function isMatchingStyle<T extends EffectStyle | PaintStyle | TextStyle>(
  tokenName: string,
  tokenPath: string,
  figmaStyleReferences: Record<string, string>,
  stylesMap?: Map<string, T>,
) {
  return !!(
    figmaStyleReferences[tokenName]
      || stylesMap?.get(tokenName)?.id
      || figmaStyleReferences[tokenPath]
      || stylesMap?.get(tokenPath)?.id
  );
}

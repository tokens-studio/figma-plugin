export type ThemeObject = {
  name: string
  // @README these are the token sets inside the theme
  selectedTokenSets: string[]
  // @README these are the style IDs from Figma
  // this is considered meta-data so it is prefixed with $
  $figmaStyleReferences: Record<string, number>
};

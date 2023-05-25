import { TokenSetStatus } from '@/constants/TokenSetStatus';

export type ThemeObject = {
  // @README let's decouple the name and ID
  // otherwise we could run into remapping issues like we have with tokens
  id: string
  name: string
  group?: string
  // @README these are the token sets inside the theme
  selectedTokenSets: Record<string, TokenSetStatus>
  // @README these are the style IDs from Figma
  // this is considered meta-data so it is prefixed with $
  $figmaStyleReferences?: Record<string, string>
};

import { TokenTypes } from '@/constants/TokenTypes';
import {
  SingleColorToken,
  SingleImplicitToken,
  SingleBorderRadiusToken,
  SingleTextToken,
  SingleTypographyToken,
  SingleOpacityToken,
  SingleBorderWidthToken,
  SingleBoxShadowToken,
  SingleFontFamiliesToken,
  SingleFontWeightsToken,
  SingleLineHeightsToken,
  SingleLetterSpacingToken,
  SingleFontSizesToken,
  SingleParagraphSpacingToken,
  SingleTextDecorationToken,
  SingleTextCaseToken,
  SingleSpacingToken,
  SingleOtherToken,
} from '../tokens';

type GenericTokenInput<T extends TokenTypes, V = string> = {
  parent: string; // the currently active tokenSet
  name: string;
  value: V;
  options: {
    type: T;
    description?: string;
  };
  oldName?: string; // only passed when editing token
  shouldUpdate?: boolean
  shouldUpdateDocument?: boolean;
};

export type UpdateTokenPayload =
  GenericTokenInput<TokenTypes.COLOR, SingleColorToken['value']>
  | GenericTokenInput<TokenTypes.IMPLICIT, SingleImplicitToken['value']>
  | GenericTokenInput<TokenTypes.BORDER_RADIUS, SingleBorderRadiusToken['value']>
  | GenericTokenInput<TokenTypes.TEXT, SingleTextToken['value']>
  | GenericTokenInput<TokenTypes.TYPOGRAPHY, SingleTypographyToken['value']>
  | GenericTokenInput<TokenTypes.OPACITY, SingleOpacityToken['value']>
  | GenericTokenInput<TokenTypes.BORDER_WIDTH, SingleBorderWidthToken['value']>
  | GenericTokenInput<TokenTypes.BOX_SHADOW, SingleBoxShadowToken['value']>
  | GenericTokenInput<TokenTypes.FONT_FAMILIES, SingleFontFamiliesToken['value']>
  | GenericTokenInput<TokenTypes.FONT_WEIGHTS, SingleFontWeightsToken['value']>
  | GenericTokenInput<TokenTypes.LINE_HEIGHTS, SingleLineHeightsToken['value']>
  | GenericTokenInput<TokenTypes.LETTER_SPACING, SingleLetterSpacingToken['value']>
  | GenericTokenInput<TokenTypes.FONT_SIZES, SingleFontSizesToken['value']>
  | GenericTokenInput<TokenTypes.PARAGRAPH_SPACING, SingleParagraphSpacingToken['value']>
  | GenericTokenInput<TokenTypes.TEXT_DECORATION, SingleTextDecorationToken['value']>
  | GenericTokenInput<TokenTypes.TEXT_CASE, SingleTextCaseToken['value']>
  | GenericTokenInput<TokenTypes.SPACING, SingleSpacingToken['value']>
  | GenericTokenInput<TokenTypes.OTHER, SingleOtherToken['value']>;

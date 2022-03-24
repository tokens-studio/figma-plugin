import { SingleColorToken } from './SingleColorToken';
import { SingleImplicitToken } from './SingleImplicitToken';
import { SingleBorderRadiusToken } from './SingleBorderRadiusToken';
import { SingleTextToken } from './SingleTextToken';
import { SingleSpacingToken } from './SingleSpacingToken';
import { SingleTypographyToken } from './SingleTypographyToken';
import { SingleOpacityToken } from './SingleOpacityToken';
import { SingleBorderWidthToken } from './SingleBorderWidthToken';
import { SingleBoxShadowToken } from './SingleBoxShadowToken';
import { SingleFontFamiliesToken } from './SingleFontFamiliesToken';
import { SingleFontWeightsToken } from './SingleFontWeightsToken';
import { SingleLineHeightsToken } from './SingleLineHeightsToken';
import { SingleLetterSpacingToken } from './SingleLetterSpacingToken';
import { SingleFontSizesToken } from './SingleFontSizesToken';
import { SingleParagraphSpacingToken } from './SingleParagraphSpacingToken';
import { SingleTextDecorationToken } from './SingleTextDecorationToken';
import { SingleTextCaseToken } from './SingleTextCaseToken';
import { SingleOtherToken } from './SingleOtherToken';

export type SingleToken<Named extends boolean = true> =
  SingleColorToken<Named>
  | SingleImplicitToken<Named>
  | SingleBorderRadiusToken<Named>
  | SingleTextToken<Named>
  | SingleTypographyToken<Named>
  | SingleOpacityToken<Named>
  | SingleBorderWidthToken<Named>
  | SingleBoxShadowToken<Named>
  | SingleFontFamiliesToken<Named>
  | SingleFontWeightsToken<Named>
  | SingleLineHeightsToken<Named>
  | SingleLetterSpacingToken<Named>
  | SingleFontSizesToken<Named>
  | SingleParagraphSpacingToken<Named>
  | SingleTextDecorationToken<Named>
  | SingleTextCaseToken<Named>
  | SingleSpacingToken<Named>
  | SingleOtherToken<Named>;

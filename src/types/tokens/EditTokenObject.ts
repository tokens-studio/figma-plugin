import { SingleBorderRadiusToken } from './SingleBorderRadiusToken';
import { SingleBorderWidthToken } from './SingleBorderWidthToken';
import { SingleBoxShadowToken } from './SingleBoxShadowToken';
import { SingleColorToken } from './SingleColorToken';
import { SingleCompositionToken } from './SingleCompositionToken';
import { SingleFontFamiliesToken } from './SingleFontFamiliesToken';
import { SingleFontSizesToken } from './SingleFontSizesToken';
import { SingleFontWeightsToken } from './SingleFontWeightsToken';
import { SingleLetterSpacingToken } from './SingleLetterSpacingToken';
import { SingleLineHeightsToken } from './SingleLineHeightsToken';
import { SingleOpacityToken } from './SingleOpacityToken';
import { SingleOtherToken } from './SingleOtherToken';
import { SingleParagraphSpacingToken } from './SingleParagraphSpacingToken';
import { SingleSpacingToken } from './SingleSpacingToken';
import { SingleTextCaseToken } from './SingleTextCaseToken';
import { SingleTextDecorationToken } from './SingleTextDecorationToken';
import { SingleTextToken } from './SingleTextToken';
import { SingleToken } from './SingleToken';
import { SingleTypographyToken } from './SingleTypographyToken';
import type { TokenTypeSchema } from './TokenTypeSchema';

type EditTokenObjectProperties = {
  initialName: string;
  isPristine: boolean;
  schema: TokenTypeSchema;
};

type PartialExceptType<Named extends boolean, T extends SingleToken<Named>> = { type: T['type'] } & Partial<Omit<T, 'type'>>;

export type EditTokenObject<Named extends boolean = true> =
PartialExceptType<Named, SingleColorToken<Named, EditTokenObjectProperties>>
| PartialExceptType<Named, SingleBorderRadiusToken<Named, EditTokenObjectProperties>>
| PartialExceptType<Named, SingleTextToken<Named, EditTokenObjectProperties>>
| PartialExceptType<Named, SingleTypographyToken<Named, EditTokenObjectProperties>>
| PartialExceptType<Named, SingleOpacityToken<Named, EditTokenObjectProperties>>
| PartialExceptType<Named, SingleBorderWidthToken<Named, EditTokenObjectProperties>>
| PartialExceptType<Named, SingleBoxShadowToken<Named, EditTokenObjectProperties>>
| PartialExceptType<Named, SingleFontFamiliesToken<Named, EditTokenObjectProperties>>
| PartialExceptType<Named, SingleFontWeightsToken<Named, EditTokenObjectProperties>>
| PartialExceptType<Named, SingleLineHeightsToken<Named, EditTokenObjectProperties>>
| PartialExceptType<Named, SingleLetterSpacingToken<Named, EditTokenObjectProperties>>
| PartialExceptType<Named, SingleFontSizesToken<Named, EditTokenObjectProperties>>
| PartialExceptType<Named, SingleParagraphSpacingToken<Named, EditTokenObjectProperties>>
| PartialExceptType<Named, SingleTextDecorationToken<Named, EditTokenObjectProperties>>
| PartialExceptType<Named, SingleTextCaseToken<Named, EditTokenObjectProperties>>
| PartialExceptType<Named, SingleSpacingToken<Named, EditTokenObjectProperties>>
| PartialExceptType<Named, SingleOtherToken<Named, EditTokenObjectProperties>>
| PartialExceptType<Named, SingleCompositionToken<Named, EditTokenObjectProperties>>;

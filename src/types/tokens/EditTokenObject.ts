import { EditTokenFormStatus } from '@/constants/EditTokenFormStatus';
import { SingleBorderRadiusToken } from './SingleBorderRadiusToken';
import { SingleBorderToken } from './SingleBorderToken';
import { SingleBorderWidthToken } from './SingleBorderWidthToken';
import { SingleBoxShadowToken } from './SingleBoxShadowToken';
import { SingleColorToken } from './SingleColorToken';
import { SingleCompositionToken } from './SingleCompositionToken';
import { SingleDimensionToken } from './SingleDimensionToken';
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
import { SingleBooleanToken } from './SingleBooleanToken';
import { SingleToken } from './SingleToken';
import { SingleTypographyToken } from './SingleTypographyToken';
import type { TokenTypeSchema } from './TokenTypeSchema';

type EditTokenObjectProperties = {
  initialName: string;
  status: EditTokenFormStatus;
  schema: TokenTypeSchema;
};

type PartialExceptTypeAndSchema<Named extends boolean, T extends SingleToken<Named>> = { type: T['type']; schema: EditTokenObjectProperties['schema'] } & Partial<Omit<T, 'type' | 'schema'>>;

export type EditTokenObject<Named extends boolean = true> =
PartialExceptTypeAndSchema<Named, SingleColorToken<Named, EditTokenObjectProperties>>
| PartialExceptTypeAndSchema<Named, SingleBorderRadiusToken<Named, EditTokenObjectProperties>>
| PartialExceptTypeAndSchema<Named, SingleTextToken<Named, EditTokenObjectProperties>>
| PartialExceptTypeAndSchema<Named, SingleTypographyToken<Named, EditTokenObjectProperties>>
| PartialExceptTypeAndSchema<Named, SingleOpacityToken<Named, EditTokenObjectProperties>>
| PartialExceptTypeAndSchema<Named, SingleBorderWidthToken<Named, EditTokenObjectProperties>>
| PartialExceptTypeAndSchema<Named, SingleBoxShadowToken<Named, EditTokenObjectProperties>>
| PartialExceptTypeAndSchema<Named, SingleFontFamiliesToken<Named, EditTokenObjectProperties>>
| PartialExceptTypeAndSchema<Named, SingleFontWeightsToken<Named, EditTokenObjectProperties>>
| PartialExceptTypeAndSchema<Named, SingleLineHeightsToken<Named, EditTokenObjectProperties>>
| PartialExceptTypeAndSchema<Named, SingleLetterSpacingToken<Named, EditTokenObjectProperties>>
| PartialExceptTypeAndSchema<Named, SingleFontSizesToken<Named, EditTokenObjectProperties>>
| PartialExceptTypeAndSchema<Named, SingleParagraphSpacingToken<Named, EditTokenObjectProperties>>
| PartialExceptTypeAndSchema<Named, SingleTextDecorationToken<Named, EditTokenObjectProperties>>
| PartialExceptTypeAndSchema<Named, SingleTextCaseToken<Named, EditTokenObjectProperties>>
| PartialExceptTypeAndSchema<Named, SingleSpacingToken<Named, EditTokenObjectProperties>>
| PartialExceptTypeAndSchema<Named, SingleOtherToken<Named, EditTokenObjectProperties>>
| PartialExceptTypeAndSchema<Named, SingleCompositionToken<Named, EditTokenObjectProperties>>
| PartialExceptTypeAndSchema<Named, SingleDimensionToken<Named, EditTokenObjectProperties>>
| PartialExceptTypeAndSchema<Named, SingleBorderToken<Named, EditTokenObjectProperties>>
| PartialExceptTypeAndSchema<Named, SingleBooleanToken<Named, EditTokenObjectProperties>>;

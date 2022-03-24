import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleLetterSpacingToken<Named extends boolean = true> = SingleGenericToken<TokenTypes.LETTER_SPACING, string, Named>;

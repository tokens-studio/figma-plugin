import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleLetterSpacingToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.LETTER_SPACING, string, Named, P>;

import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleParagraphSpacingToken<Named extends boolean = true> = SingleGenericToken<TokenTypes.PARAGRAPH_SPACING, string, Named>;

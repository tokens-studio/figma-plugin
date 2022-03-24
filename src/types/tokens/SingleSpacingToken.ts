import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleSpacingToken<Named extends boolean = true> = SingleGenericToken<TokenTypes.SPACING, string, Named>;

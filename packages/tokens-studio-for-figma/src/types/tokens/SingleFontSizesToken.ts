import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleFontSizesToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.FONT_SIZES, string, Named, P>;

import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleFontFamiliesToken<Named extends boolean = true> = SingleGenericToken<TokenTypes.FONT_FAMILIES, string, Named>;

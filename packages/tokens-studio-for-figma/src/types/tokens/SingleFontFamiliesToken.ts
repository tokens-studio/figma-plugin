import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleFontFamiliesToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.FONT_FAMILIES, string, Named, P>;

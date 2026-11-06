import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleFontWeightsToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.FONT_WEIGHTS, number | string, Named, P>;

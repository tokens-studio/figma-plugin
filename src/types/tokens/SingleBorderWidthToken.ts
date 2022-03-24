import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleBorderWidthToken<Named extends boolean = true> = SingleGenericToken<TokenTypes.BORDER_WIDTH, string, Named>;

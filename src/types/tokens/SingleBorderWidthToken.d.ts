import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';
export declare type SingleBorderWidthToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.BORDER_WIDTH, string, Named, P>;

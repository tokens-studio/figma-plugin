import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';
export declare type SingleOtherToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.OTHER, string, Named, P>;

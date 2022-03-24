import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';
export declare type SingleImplicitToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.IMPLICIT, string, Named, P>;

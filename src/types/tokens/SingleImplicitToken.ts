import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';

// @TODO remove implicit type token if not used anymore
export type SingleImplicitToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.IMPLICIT, string, Named, P>;

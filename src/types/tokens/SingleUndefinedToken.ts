import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleUndefinedToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.UNDEFINED, string, Named, P>;

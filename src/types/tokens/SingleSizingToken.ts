import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleSizingToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.SIZING, string, Named, P>;

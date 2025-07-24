import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleDimensionToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.DIMENSION, string, Named, P>;

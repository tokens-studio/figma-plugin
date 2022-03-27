import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleSizingToken = SingleGenericToken<TokenTypes.SIZING, string>;

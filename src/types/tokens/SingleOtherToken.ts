import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleOtherToken<Named extends boolean = true> = SingleGenericToken<TokenTypes.OTHER, string, Named>;

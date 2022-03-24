import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleColorToken<Named extends boolean = true> = SingleGenericToken<TokenTypes.COLOR, string, Named>;

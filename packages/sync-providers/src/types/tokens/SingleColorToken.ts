import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleColorToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.COLOR, string, Named, P>;

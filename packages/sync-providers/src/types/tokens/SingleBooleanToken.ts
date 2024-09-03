import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleBooleanToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.BOOLEAN, string, Named, P>;

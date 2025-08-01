import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleNumberToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.NUMBER, number | string, Named, P>;

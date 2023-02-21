import { TokenTypes } from '@/constants/TokenTypes';
import { TokenBorderValue } from '../values';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleBorderToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.BORDER, TokenBorderValue, Named, P>;

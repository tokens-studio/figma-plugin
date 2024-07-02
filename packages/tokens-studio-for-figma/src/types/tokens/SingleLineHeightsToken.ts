import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleLineHeightsToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.LINE_HEIGHTS, string, Named, P>;
